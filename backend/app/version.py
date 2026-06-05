VERSION      = "2.8.0"
RELEASE_DATE = "2026-06-05"

_parts = VERSION.split(".")
VERSION_MAJOR = int(_parts[0])
VERSION_MINOR = int(_parts[1])
VERSION_PATCH = int(_parts[2])

VERSION_LABEL = f"v{VERSION}"


def get_version_info() -> dict:
    return {
        "version":      VERSION,
        "label":        VERSION_LABEL,
        "major":        VERSION_MAJOR,
        "minor":        VERSION_MINOR,
        "patch":        VERSION_PATCH,
        "release_date": RELEASE_DATE,
    }
