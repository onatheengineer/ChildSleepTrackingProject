## CODE I DEVELOPED FOR A COMPANY THAT SHUT DOWN BEFORE CODE WENT INTO PRODUCTION ##  
- CODE IN THIS REPOSITORY WAS NEVER, AND HAS NEVER, BEEN IN PRODUCTION WITH ANY COMPANY

TERRAFORM

# init - docker-compose -f docker-compose.yml run --rm terraform init

# format code: docker-compose -f docker-compose.yml run --rm terraform fmt

# validate - checks for errors in terraform code - code: docker-compose -f docker-compose.yml run --rm terraform validate

# plan - this outputs the plan that WILL be made, but no plan made yet - code: docker-compose -f docker-compose.yml run --rm terraform validate

# apply - happy with plan? yes, then hit apply: docker-compose -f docker-compose.yml run --rm terraform apply

# if you need to init again, make sure to delete the terraform directory

# terraform apply -lock=false - the dynamo table need to be made via terraform -- tf needs to create this not us manually via the AWS console

Terraform workspaces

# test, stage, prod

# Subcommands:

    delete    Delete a workspace
    list      List Workspaces
    new       Create a new workspace
    select    Select a workspace
    show      Show the name of the current workspace

# workspace list - docker-compose -f docker-compose.yml run --rm terraform workspace list

# add workspace dev - docker-compose -f docker-compose.yml run --rm terraform workspace new dev

# workspace select `test`, workspace delete

QUICKTYPE

# to generate Types from Jsons https://app.quicktype.io/

# example: quicktype update-temperature.json -o UpdateTemperature.ts
