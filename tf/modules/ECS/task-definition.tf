resource "aws_ecs_task_definition" "acoustic-challenge-api" {
  container_definitions = file("${path.module}/container.json")
  family = "acoustic-challenge-api"
  memory = "256"
  cpu = "256"
}
