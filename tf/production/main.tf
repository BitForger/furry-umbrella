provider "aws" {
  region = "us-east-1"
}
terraform {
  backend "s3" {
    bucket = "nkovacs-tf-conf-states"
    key = "acoustic-challenge-api/acoustic-challenge-api.tfstate"
    region = "us-east-1"
  }
}
module "ECS" {
  source = "../modules/ECS"
}
