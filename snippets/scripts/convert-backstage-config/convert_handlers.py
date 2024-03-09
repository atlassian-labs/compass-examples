# Field Handler Functions. For the Compass YAML structure, refer:
# https://developer.atlassian.com/cloud/compass/config-as-code/structure-and-contents-of-a-compass-yml-file/

def handle_name(value):
    """
    Convert the name value from Backstage to Compass format.

    :param value: The name value from Backstage.
    :return: The name value in Compass format.
    """
    # Compass has a limit of 512 characters for the name
    return value.replace("\u0000", "").strip()[:512]


def handle_description(value):
    """
    Convert the description value from Backstage to Compass format.

    :param value: The description value from Backstage.
    :return: The description value in Compass format.
    """
    # Compass has a limit of 4096 characters for the description
    return value.replace("\u0000", "").strip()[:4096]


def handle_lifecycle(value):
    """
    Convert the lifecycle value from Backstage to Compass format.
    Available values in Compass are Pre-Release, Active, Deprecated.

    :param value: The lifecycle value from Backstage.
    :return: The lifecycle value in Compass format.
    """
    lifecycle_mappings = {
        "experimental": "Pre-Release",
        "beta": "Pre-Release",
        "production": "Active",
        "deprecated": "Deprecated",
        "end-of-life": "Deprecated"
    }

    # Implement your conversion logic here
    if value.lower() in lifecycle_mappings:
        return lifecycle_mappings[value.lower()]

    return value


def handle_links(values):
    """
    Convert the links from Backstage to Compass format.
    Refer to the Compass YAML link at the top for available link types.

    :param values: The links from Backstage.
    :return: The links in Compass format.
    """
    link_type_mappings = {
        "source": "REPOSITORY",
        "docs": "DOCUMENT",
        "ci": "DASHBOARD",
        "cd": "DASHBOARD",
        "dashboard": "DASHBOARD",
        "logs": "DASHBOARD"
    }

    result = []

    # Compass has a limit of 10 links per component
    for link in values[:10]:
        link_type = link_type_mappings.get(link["type"].lower(), "OTHER_LINK")
        link_name = link.get("title", None)
        link_url = link["url"]

        result.append({
            "type": link_type,
            "name": link_name,
            "url": link_url
        })

    return result


def handle_tier(value):
    """
    Convert the tier value from Backstage to Compass format.
    Available values in Compass are Tier 1 through Tier 4.

    :param value: The tier value from Backstage.
    :return: The tier value in Compass format.
    """
    if value is None:
        return None

    # Implement your conversion logic here if needed
    tier_value = int(value)
    return max(1, min(4, tier_value))


def handle_type(value):
    """
    Convert the type value from Backstage to Compass format.
    Refer to the Compass YAML link at the top for available component types.

    :param value: The type value from Backstage.
    :return: The type value in Compass format.
    """
    component_type_mappings = {
        "service": "SERVICE",
        "website": "WEBSITE",
        "library": "LIBRARY",
        "sdk": "LIBRARY"
    }

    # Implement your conversion logic here if needed
    return component_type_mappings.get(value.lower(), "SERVICE")


def handle_labels(value):
    """
    Convert the labels from Backstage to Compass format.

    :param value: The list of tags from Backstage.
    :return: The labels in Compass format.
    """
    # Tagging all components as imported from Backstage
    value += ["imported:backstage"]

    # Compass has a limit of 10 labels per component
    return value[:10]


FIELD_HANDLERS = {
    "handle_name": handle_name,
    "handle_description": handle_description,
    "handle_lifecycle": handle_lifecycle,
    "handle_links": handle_links,
    "handle_tier": handle_tier,
    "handle_type": handle_type,
    "handle_labels": handle_labels,
}
