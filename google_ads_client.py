"""
Google Ads API Client Configuration
Empire Amplify - Core automation library

This module provides a centralized client for interacting with the Google Ads API.
"""

import os

from dotenv import load_dotenv
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from loguru import logger

# Load environment variables
load_dotenv()


def get_google_ads_client():
    """
    Initialize and return a Google Ads API client.

    Uses environment variables for configuration:
    - GOOGLE_ADS_DEVELOPER_TOKEN
    - GOOGLE_ADS_LOGIN_CUSTOMER_ID
    - GOOGLE_ADS_CLIENT_ID
    - GOOGLE_ADS_CLIENT_SECRET
    - GOOGLE_ADS_REFRESH_TOKEN

    Returns:
        GoogleAdsClient: Configured client instance
    """
    config_path = os.getenv("GOOGLE_ADS_CONFIG_PATH")

    if config_path and os.path.exists(config_path):
        logger.info(f"Loading Google Ads config from: {config_path}")
        return GoogleAdsClient.load_from_storage(config_path)

    # Build config from environment variables
    credentials = {
        "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "login_customer_id": os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
        "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
        "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN"),
        "use_proto_plus": True,
    }

    logger.info("Initializing Google Ads client from environment variables")
    return GoogleAdsClient.load_from_dict(credentials)


def get_customer_id():
    """Get the customer ID to manage from environment."""
    customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID")
    if not customer_id:
        raise ValueError("GOOGLE_ADS_CUSTOMER_ID not set in environment")
    return customer_id.replace("-", "")


def handle_google_ads_exception(ex: GoogleAdsException):
    """
    Handle and log Google Ads API exceptions.

    Args:
        ex: GoogleAdsException to handle
    """
    logger.error(f"Request ID: {ex.request_id}")

    for error in ex.failure.errors:
        logger.error(f"Error code: {error.error_code}")
        logger.error(f"Error message: {error.message}")

        if error.location:
            for field_path_element in error.location.field_path_elements:
                logger.error(f"  Field: {field_path_element.field_name}")


if __name__ == "__main__":
    # Test the connection
    try:
        client = get_google_ads_client()
        customer_id = get_customer_id()
        logger.info(f"✅ Successfully connected to Google Ads API")
        logger.info(f"Customer ID: {customer_id}")
    except Exception as e:
        logger.error(f"❌ Failed to connect: {e}")
