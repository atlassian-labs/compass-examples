#!/usr/bin/env python3
"""
In this script, the `MAPPINGS` dictionary defines a mapping from input paths in the Backstage YAML to output paths
in the Compass YAML. Paths are specified as strings with dots separating each level of nesting. You can add more
entries to this dictionary as needed.
"""

import yaml
import argparse
import sys
import logging

from functools import reduce
from operator import getitem

from convert_handlers import FIELD_HANDLERS

# Mapping of Backstage YAML fields to Compass YAML fields - add more mappings here as needed
MAPPINGS = {
    "metadata.name": {"path": "name", "handler": "handle_name"},
    "metadata.description": {"path": "description", "handler": "handle_description"},
    "metadata.labels.tier": {"path": "fields.tier", "handler": "handle_tier"},
    "metadata.links": {"path": "links", "handler": "handle_links"},
    "metadata.tags": {"path": "labels", "handler": "handle_labels"},
    "spec.lifecycle": {"path": "fields.lifecycle", "handler": "handle_lifecycle"},
    "spec.type": {"path": "typeId", "handler": "handle_type"},
}


def load_yaml(file_path):
    """Load a YAML file from the given path."""
    try:
        with open(file_path, 'r') as file:
            return yaml.safe_load(file)
    except Exception as e:
        print(f"Error loading YAML file: {e}", file=sys.stderr)
        sys.exit(1)


def dump_yaml(data, file_path):
    """Dump a YAML file to the given path."""
    try:
        with open(file_path, 'w') as file:
            yaml.dump(data, file)
    except Exception as e:
        print(f"Error dumping YAML file: {e}", file=sys.stderr)
        sys.exit(1)


def create_parser():
    """Create an argument parser for the script."""
    parser = argparse.ArgumentParser(description='Convert Backstage YAML to Compass YAML.')
    parser.add_argument('input_file_path', type=str, help='Path to the input Backstage YAML file.')
    parser.add_argument('-o', '--output', type=str, help='Path to the output Compass YAML file.')
    parser.add_argument('-dry', '--dry-run', action='store_true', help='Run the script without writing any files.')
    return parser


def map_properties(input_data):
    """Map properties from Backstage YAML to Compass YAML."""
    if input_data.get("kind", None) != "Component":
        logging.error("The input file is not a valid Backstage Component YAML file.")
        raise ValueError("Invalid input file")

    # Start with default config data
    output_data = {
        "configVersion": 1,
        "fields": {},
        "labels": ["imported:backstage"]
    }

    for input_path, output_info in MAPPINGS.items():
        try:
            input_value = get_value_from_path(input_data, input_path.split('.'))

            if isinstance(output_info, dict):
                handler_name = output_info.get("handler", None)
                if handler_name:
                    handler = FIELD_HANDLERS.get(handler_name, None)
                    if handler is None:
                        err = f"Handler '{handler_name}' is not implemented for input path '{input_path}'"
                        raise NotImplementedError(err)

                    input_value = handler(input_value)

                # Skip if input value is None
                if input_value is None:
                    continue

                output_path = output_info.get("path", "").split('.')
            else:
                output_path = output_info.split('.')

            set_value_at_path(output_data, output_path, input_value)
        except Exception as e:
            logging.error(f"Error occurred while mapping properties: {str(e)}")
            raise e
    return output_data


def get_value_from_path(data, path):
    """Get a value from a nested dictionary using a list of keys."""
    try:
        return reduce(getitem, path, data)
    except KeyError:
        err = f"The input path '{path}' does not exist in the input data."
        logging.error(f"KeyError: {err}")
        raise KeyError(err)


def set_value_at_path(data, path, value):
    """Set a value in a nested dictionary using a list of keys."""
    for key in path[:-1]:
        data = data.setdefault(key, {})
    data[path[-1]] = value


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    try:
        parser = create_parser()
        args = parser.parse_args()

        input_data = load_yaml(args.input_file_path)
        output_data = map_properties(input_data)

        if args.dry_run or args.output is None:
            print(yaml.dump(output_data))
        else:
            dump_yaml(output_data, args.output)

    except Exception as e:
        logging.error(f"Error occurred: {str(e)}")
        sys.exit(1)
