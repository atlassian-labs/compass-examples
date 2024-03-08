# Backstage to Compass Config Conversion

The `convert_to_compass.py` script is used to convert Backstage YAML config to Compass YAML config. Backstage usages can vary between organizations and teams. The script may not cover all the use cases. If you have custom requirements, you can update the `convert_handlers.py` and `convert_to_compass.py` scripts to handle them. For more information, see the [Structure and contents of a compass.yml file](https://developer.atlassian.com/cloud/compass/config-as-code/structure-and-contents-of-a-compass-yml-file/).

## Usage

```bash
python convert_to_compass.py <path-to-backstage-config-file> -o <path-to-compass-config-file>
```

The script takes the following arguments:
- `path-to-backstage-config-file`: The path to the Backstage config file as a positional argument.
- `-o`, `--output`: The path to the Compass config file as an optional argument. If not provided, the script will print the Compass config file to stdout.
- `-dry`, `--dry-run`: If provided, the script will not write the Compass config file to the output path. It will only print the converted config to stdout.
- `-h`, `--help`: Show the help message and exit.

## Running in bulk

To run the script in a CI/CD pipeline or automated process, you can use the following command to put the converted Compass config files in the same directory as the Backstage config files:

```bash
find . -name "backstage.yaml" | xargs -I {} sh -c 'python convert_to_compass.py {} -o "$(dirname {})/compass.yaml"'
```

## Limitations

The script has the following limitations:
- It does not handle all the possible use cases of Backstage config.
- Component ID has to be manually linked after YAML is used to create the model in Compass.
- Similarly, dependency and ownership relationships have to be manually linked after the model is created in Compass.
- Custom fields must exist in Compass before those can be used in the YAML config.