terraform {
  required_providers {
    aws = {
      source : "hashicorp/aws"
      version = "~> 5.0.1"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~>2.3.0"
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = merge(
      local.common_tags
    )
  }
}
