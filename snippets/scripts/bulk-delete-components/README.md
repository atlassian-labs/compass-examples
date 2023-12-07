# How to use this
This is a python script to perform bulk deletion of components given a list of component IDs (in ARI format).

Skip to step 2 if you already have a file of component IDs with one on each line to delete.

1. Run a search for the component ids to delete and place them in a file with one component ID per line. You can use the [search_components.py](/snippets/graphql/search-components/search_components.py) script (make sure to replace `email`, `api_token`, and `cloudId` in the file) to retrieve **ALL** of the components on your site and place them in a text file called `component_ids.txt`, but you may need to alter the search conditions based on what components you'd like to delete. 

2. Assuming you have a text file called `component_ids.txt` with the list of component IDs to delete, you can then use the `delete_components.py` script to delete all of these components. Alternatively, without a separate text file, you may specify the component ids in the `component_ids` variables in the script. Make sure to replace `api_token` and `email` in the in the script. The script has a "dry_run" boolean that can be used to check how many components will be deleted before they are actually deleted. Set "dry_run = False" to delete the components.