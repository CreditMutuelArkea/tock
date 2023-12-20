"""Simple recursive webscraper based on a list of BeautifulSoup filters.

Usage:
    webscraping.py <input_urls> <soup_filters> <output_csv>

Arguments:
    input_urls      a comma-separated list of base URLs the scraper will 
                    browse recursively to find scrapable contents
    soup_filters    a comma-separated list of filters to get pages contents 
                    (texts to be indexed will be concatenated in this order)
                    Example: id='notes',class_='container',id='test'
    output_csv      path to the output, ready-to-index CSV file (this file will 
                    be created at execution time, along with a 
                    <base URL netloc>/ sub-dir in the same directory, containg 
                    debug info)

Recursively browse web URLs (follow links from these base URLs), then scrape 
links' contents based on a list of BeautifulSoup filters, then export these 
contents into a ready-to-index CSV file (one 'title'|'url'|'text' line per 
URL with scraped contents).
"""
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from docopt import docopt

import os, sys
from urllib.parse import urljoin, urlparse
import pandas as pd

def browse_base_urls(base_urls, target_dir='.', base_domain='domain'):
    """
    Recursively browse URLs for sub-URLs. Creates the <base_domain>/urls.txt
    file along the way (the base URLs are listed in this file).

    Arguments:
        base_urls   a list of base URLs that will be browsed recursively 
                    for sub-URLs (follow links)
        target_dir  the directory to store output files
        base_domain all sub-URLs will be checked to be in this base domain, 
                    and all debug will go in a subdirectory with this name
    """

    # Create the debug sub-directory if it does not already exist
    path = Path(target_dir) / base_domain
    path.mkdir(parents=True, exist_ok=True)
    
    # Open results file
    path = path / 'urls.txt'
    with open(path, 'w') as output_file:

        # memorize visited URLs
        visited_urls = set()

        # Browse each base URL recursively
        while base_urls:
            base_url = base_urls.pop()

            # Loop recursively through the URLs to be visited, from the base URL
            urls_to_visit = {base_url}
            while urls_to_visit:
                
                current_url = urls_to_visit.pop()
                print(f"Visiting: {current_url}")

                try:
                    # Check URL is valid
                    response = requests.get(current_url)
                    if response.status_code == 200:

                        # Scrape the HTML page with BeautifulSoup
                        soup = BeautifulSoup(response.content, 'html.parser')

                        # Check base URL domain is in the same domain
                        base_url_href = soup.find(name='base').get('href')
                        base_url_domain = urlparse(base_url_href).netloc
                        if base_url_domain == base_domain:
                        
                            # Find all links on the page
                            for link in soup.find_all('a', class_='btn_arrow'):

                                # Get the URL from the link
                                link_url = link.get('href')
                                if link_url:
                                    # Normalize the link URL by joining it with the base URL
                                    link_url = urljoin(base_url_href, link_url)

                                    # Add the link URL to the set of URLs to be visited if it hasn't been visited yet
                                    if link_url not in visited_urls:
                                        print(f"Add to-be-visited link: {link_url}")
                                        urls_to_visit.add(link_url)

                            # Write row in output file
                            output_file.write(f"{current_url}\n")
                            # Add current url to the set of visited URLs
                            visited_urls.add(current_url)
                            print(f"Add to visited: {current_url}")
                        else:
                            print(f"Warning: URL '{current_url}' is ignored because its base URL href ({base_url_href}) is not in the '{base_domain}' domain")
                    else:
                        print(f"Warning: URL '{current_url}' is ignored because it answered GET with code {response.status_code}")

                except requests.exceptions.RequestException as e:
                    print(f"Warning: URL '{current_url}' is ignored because it failed to answer GET ({e})")


def scrape_urls(soup_filters, output_file, target_dir='.', base_domain='domain'):
    results = []

    # fetch URLs file contents
    urls_file_path = Path(target_dir) / base_domain / 'urls.txt'
    with open(urls_file_path, 'r') as file:
        # Scrape contents for each line
        for line in file:
            line = line.strip()
            print(f"Scraping {line}")
            
            # GET contents
            response = requests.get(line)

            # Check if response object is not None
            if response is not None:
                # Scrape the HTML page for tags corresponding to BeautifulSoup filters
                soup = BeautifulSoup(response.content, 'html.parser')
                main_tags = [soup.find(**soup_filter) for soup_filter in soup_filters]

                if main_tags:
                    # Create a filename based on the url
                    contents_filename = line.replace('https://', '').replace('http://', '').replace('/', '_').replace(':', '') + '.txt'
                    contents_file_path = Path(target_dir) / base_domain / contents_filename
                    # Scrape contents for each main Tag
                    scraped_texts = [tag.get_text(separator='\n', strip=True) for tag in main_tags if tag is not None]
                    # Contatenate texts
                    full_text = '\n'.join(scraped_texts)
                    # Write the processed text to the corresponding file
                    with open(contents_file_path, 'w') as contents_file:
                        contents_file.write(full_text)

                    # Scrape title (remove trailing e.g. ' | Crédit Mutuel de Bretagne')
                    title = soup.find(name='title').get_text(separator='\n', strip=True).split(sep=' | ')[0]

                    # Add URL with title and text to output file
                    results.append({'title': title, 'url': line, 'text': full_text})
                else:
                    print(f"Line {line} is ignored (empty tags)")
            else:
                print(f"Warning: URL '{line}' is ignored because it failed to answer GET")

    # Save to output CSV file (use pandas to ensure 'ready-to-index' consistency)
    pd.DataFrame(results).to_csv(output_file, sep='|', index=False)

if __name__ == '__main__':
    cli_args = docopt(__doc__, version='Webscraper 0.1.0')
    
    # Check args:
    # - input URLs
    base_urls = cli_args['<input_urls>'].split(',')
    if not base_urls[0]:
        print(f"Cannot proceed: could not find a URL in list '{base_urls}'.")
        sys.exit(1)
    base_domain = urlparse(base_urls[0]).netloc
    for base_url in base_urls:
        parsed_url = urlparse(base_url)
        if not parsed_url.scheme or not parsed_url.netloc:
            print(f"Cannot proceed: '{base_url}' is not a valid URL.")
            sys.exit(1)
        if base_domain != parsed_url.netloc:
            print(f"Cannot proceed: '{base_url}' has a different base domain ('{parsed_url.netloc}') than previous URLs ('{base_domain}').")
            sys.exit(1)

    # - BeautifulSoup filters
    filters = cli_args['<soup_filters>'].split(',')
    filters_as_dicts = []
    if filters:
        for filter in filters:
            key, value = filter.split('=')
            value = value.strip("'")# Strip extra quotes (we want a dict of {str: str})
            if key and value:
                filters_as_dicts.append({key: value})
            else:
                print(f"Cannot proceed: BeautifulSoup filter '{filter}' could not be parsed into a key and its value.")
                sys.exit(1)
    else:
        print(f"Cannot proceed: BeautifulSoup filters arg ({cli_args['<soup_filters>']}) could not be parsed for a list of filters.")
        sys.exit(1)

    # - output file path
    target_dir = os.path.dirname(cli_args['<output_csv>'])
    if not os.access(target_dir, os.W_OK):
        print(f"Cannot proceed: directory {target_dir} does not exist or is not writable.")
        sys.exit(1)
    if os.path.exists(cli_args['<output_csv>']) and not os.access(cli_args['<output_csv>'], os.W_OK):
        print(f"Cannot proceed: file {cli_args['<output_csv>']} is not writable.")
        sys.exit(1)

    # Browse base URLs recursively to populate the urls.txt file listing all URLs to be scraped
    browse_base_urls(base_urls=base_urls, 
                     target_dir=target_dir, 
                     base_domain=base_domain)
    # Scrape all URLs from urls.txt using BeautifulSoup filters
    scrape_urls(soup_filters=filters_as_dicts, 
                output_file=cli_args['<output_csv>'], 
                target_dir=target_dir, 
                base_domain=base_domain)