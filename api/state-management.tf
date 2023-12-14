terraform {
  backend "s3" {
    // bucket versioning is enabled
    bucket         = "PROJECT-api-tfstate"
    key            = "PROJECTapi.tfstate"
    region         = ""
    encrypt        = true
    dynamodb_table = "PROJECT-all-PROJECT_terraform_state_lock"
    #    lifecycle {
    #      prevent_destroy = true
    #    }
  }
}

