from textual.app import App, ComposeResult
from textual.containers import Vertical, Horizontal
from textual.widgets import Button, Input, Static, Checkbox
import json
import os

class GenConfigApp(App):
    CSS = """
    Screen {
        layout: vertical;
        align: center middle;
    }
    #form {
        height: auto;
        width: 60%;
    }
    Input {
        margin: 1 0;
    }
    .subsection {
        border: solid $primary;
        margin: 1 0;
        padding: 1;
        height: auto;
    }
    .subsection-title {
        text-style: bold;
        color: $primary;
        margin: 0 0 1 0;
    }
    """

    form = {
        "bot": {
            "namespace": {"data_type": "text", "data": None},
            "bot_id": {"data_type": "text", "data": None},
            "file_location": {"data_type": "text", "data": None}
        },
        "em_setting": {
            "provider": {"data_type": "text", "data": None},
            "api_key": {
                "type": {"data_type": "text", "data": None},
                "secret": {"data_type": "text", "data": None}
            },
            "api_base": {"data_type": "text", "data": None},
            "api_version": {"data_type": "text", "data": None},
            "deployment_name": {"data_type": "text", "data": None},
            "model": {"data_type": "text", "data": None}
        },
        "vector_store_setting": {
            "provider": {"data_type": "text", "data": None},
            "host": {"data_type": "text", "data": None},
            "port": {"data_type": "integer", "data": None},
            "username": {"data_type": "text", "data": None},
            "password": {
                "type": {"data_type": "text", "data": None},
                "secret": {"data_type": "text", "data": None}
            },
            "database": {"data_type": "text", "data": None}
        },
        "data_csv_file": {"data_type": "text", "data": None},
        "document_index_name": {"data_type": "text", "data": None},
        "chunk_size": {"data_type": "integer", "data": None},
        "embedding_bulk_size": {"data_type": "integer", "data": None},
        "ignore_source": {"data_type": "bool", "data": None},
        "append_doc_title_and_chunk": {"data_type": "bool", "data": None}
    }

    def compose(self) -> ComposeResult:
        yield Static("Multi-Page Dynamic Form", id="title")
        yield Vertical(id="form")
        yield Horizontal(
            Button("Previous", id="prev"),
            Button("Next", id="next"),
            Button("Write to JSON", id="save"),
            id="buttons"
        )

    def on_mount(self) -> None:
        self.current_page = 0
        self.len_pages = 1
        for dict in self.form.values():
            if not "data_type" in dict:
                self.len_pages += 1
        self.load_form_page()

    @staticmethod
    def labelize(text: str) -> str:
        """Convert text to a label-friendly format."""
        text = text.replace("_", " ").lower()
        text = text.capitalize()
        return text

    def gen_widgets(self, container, dict, dict_id=""):
        for key, value in dict.items():
            data_type = value.get("data_type")
            if data_type is None and self.current_page == self.len_pages - 1:
                continue
            if data_type is None:
                subsection = Vertical(classes="subsection", id=f"{dict_id}__{key}")
                container.mount(subsection) 
                title = Static(self.labelize(key), classes="subsection-title")
                subsection.mount(title) 
                self.gen_widgets(subsection, value, dict_id=f"{dict_id}__{key}")
                continue
            elif data_type == "bool":
                widget = Checkbox(label=self.labelize(key), value=value.get("data") if value.get("data") is not None else False, id=f"{dict_id}__{key}")
            else:
                widget = Input(value=value.get("data"), type=data_type, placeholder=f"{self.labelize(key)} ({self.labelize(data_type)})", id=f"{dict_id}__{key}")
            container.mount(widget)

    def load_form_page(self):
        """Load inputs for the current page."""
        form_container = self.query_one("#form", Vertical)
        form_container.remove_children()

        form_keys = list(self.form.keys())
        title = self.labelize(form_keys[self.current_page])
        current_dict = self.form[form_keys[self.current_page]]
        if self.current_page == self.len_pages - 1:
            current_dict = self.form
            title = "Other Settings"
        
        dict_id = form_keys[self.current_page] if (self.current_page != self.len_pages - 1) else ""
        self.gen_widgets(form_container, current_dict, dict_id=dict_id)

        self.query_one("#title", Static).update(f" [b]{title}[/b] {self.current_page + 1}/{self.len_pages}")

    def save_current_page_data(self):
        """Save the current page data to the form dictionary."""
        form_container = self.query_one("#form", Vertical)
        widgets = list(form_container.query(Input)) + list(form_container.query(Checkbox))
        for widget in widgets:
            widget_id = widget.id.split("__")
            form_value = self.form
            for part in widget_id:
                if part != "":
                    form_value = form_value[part]
            if widget.value is None or widget.value == "":
                continue
            elif form_value["data_type"] == "integer":
                form_value["data"] = int(widget.value)
            else :
                form_value["data"] = widget.value

    def clean_form_data(self, data):
        """Remove data_type fields and extract only the data values."""
        if isinstance(data, dict):
            if "data_type" in data and "data" in data:
                return data["data"]
            else:
                cleaned = {}
                for key, value in data.items():
                    cleaned[key] = self.clean_form_data(value)
                return cleaned
        return data

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "next":
            self.save_current_page_data()
            if self.current_page < self.len_pages - 1:
                self.current_page += 1
                self.load_form_page()
        elif event.button.id == "prev":
            self.save_current_page_data()
            if self.current_page > 0:
                self.current_page -= 1
                self.load_form_page()
        elif event.button.id == "save":
            self.save_current_page_data()
            # Clean and save the form data to a JSON file
            cleaned_data = self.clean_form_data(self.form)
            config_file = "config_file.json"
            i = 0
            while os.path.exists(config_file):
                i += 1
                config_file = f"config_file_{i}.json"
            
            with open(config_file, "w") as f:
                json.dump(cleaned_data, f, indent=2)
            exit(0)
                         

if __name__ == "__main__":
    app = GenConfigApp()
    app.run()
