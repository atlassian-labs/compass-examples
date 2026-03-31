# This is only a test code. I am deliberately inserting an API token to see the behaviour
# of the github secret scanner. This should ideally get flagged immediately.
# The API token's access has been revoked before this commit.

# Set the BB_API_Token
BB_API_Token = "ATATT3xFfGF035Pz8ssmaVxLr9tGUFYhpsxBKBjol7GA4YyR-0zWDx40zrl6YVvQ8FOn6IOnrGe3-qRqeFArV3ylStucxPbllyV3lDo8NfXLYRfX1-GvXwSLtvbw0pMAELSd-lF4AAbWQJ07A_CiLhhbhJvdDF9q4sL_qPvCt_CiG72GkwMgQqI=E29B92E9"
BB_Email = "rthiy@atlassian.com"
auth = HTTPBasicAuth(BB_Email, BB_API_Token)
requestUrlBase = "https://api.bitbucket.org/2.0/repositories/"

userCheckBaseUrl = "https://api.bitbucket.org/2.0/users/"

# adding a comment