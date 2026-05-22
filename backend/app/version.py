VERSION      = "2.3.3"
RELEASE_DATE = "2026-05-22"

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
