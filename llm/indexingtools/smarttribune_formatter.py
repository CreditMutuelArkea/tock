"""Smart Tribune export file formatter.

Usage:
    smarttribune_formatter.py <input_csv> <tag_title> <base_url> <output_csv>

Arguments:
    input_csv   path to the Smart Tribune CSV export file
    tag_title   tag title to discrimate FAQ source ('Tag (ID system)' column 
                will be filtered for lines containing this tag)
    base_url    the base URL to prefix every FAQ entry's query parameter to 
                create a full URL
    output_csv  path to the output, ready-to-index CSV file

Turns a Smart Tribune CSV export file into a ready-to-index CSV file 
(one 'title'|'url'|'text' line per filtered entry).
"""
from docopt import docopt

import os, sys
from urllib.parse import urlparse
import pandas as pd


def format(args):
    """
    Read a CSV Smart Tribune export then format it into a ready-to-index CSV file.
    
    Parameters:
    args (dict): A dictionary containing command-line arguments.
                 Expecting keys:    '<input_csv>'
                                    '<tag_title>'
                                    '<base_url>'
                                    '<output_csv>'
    """
    df = pd.read_csv(args['<input_csv>'], sep='|', encoding='utf-8')
    # Filter entries based on id
    filtered_df = df[df['Tag (ID system)'].str.contains(args['<tag_title>'], na=False)].copy()# Ensure copy (not a view)
    # Add common prefix to all lines' URL
    prefixed_column = 'Prefixed URL'
    filtered_df.loc[:, prefixed_column] = args['<base_url>'] + filtered_df['Question URL']
    # Select only destination columns
    result_df = filtered_df[['Question Title', prefixed_column, 'FAQ answer (text)']]
    # Rename the columns
    result_df = result_df.rename(columns={
        'Question Title': 'title',
        prefixed_column: 'url',
        'FAQ answer (text)': 'text'
    })
    # Save to output CSV file
    result_df.to_csv(args['<output_csv>'], sep='|', index=False)

if __name__ == '__main__':
    cli_args = docopt(__doc__, version='Smart Tribune formatter 0.1.0')
    
    # Check args:
    # - input file path
    inputfile_path = cli_args['<input_csv>']
    if not os.path.isfile(inputfile_path):
        print(f"Cannot proceed: input CSV file '{inputfile_path}' does not exist.")
        sys.exit(1)

    # - tag title is arbitrary
        
    # - base url must be valid
    result = urlparse(cli_args['<base_url>'])
    if not result.scheme or not result.netloc:
        print(f"Cannot proceed: '{cli_args['<base_url>']}' is not a valid URL.")
        sys.exit(1)

    # - output file path
    target_dir = os.path.dirname(cli_args['<output_csv>'])
    if not os.access(target_dir, os.W_OK):
        print(f"Cannot proceed: directory {target_dir} does not exist or is not writable.")
        sys.exit(1)
    if os.path.exists(cli_args['<output_csv>']) and not os.access(cli_args['<output_csv>'], os.W_OK):
        print(f"Cannot proceed: file {cli_args['<output_csv>']} is not writable.")
        sys.exit(1)

    format(cli_args)