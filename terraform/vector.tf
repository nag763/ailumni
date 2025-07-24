resource "null_resource" "multiple_commands_create_bash" {

  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    when = create
    command = "aws s3vectors create-vector-bucket --vector-bucket-name 'ailumni-vector-db' && aws s3vectors create-index --vector-bucket-name 'ailumni-vector-db' --index-name 'ailumni-vector-index' --dimension 1024 --distance-metric 'cosine' --data-type float32"
  }

  provisioner "local-exec" {
    when = destroy
    command = "aws s3vectors delete-index --vector-bucket-name 'ailumni-vector-db' --index-name 'ailumni-vector-index' && aws s3vectors delete-vector-bucket --vector-bucket-name ailumni-vector-db"
  }
}