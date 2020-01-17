resource "aws_lb_target_group" "target-group" {
  name = "acoustic-api"
  port = 80
  protocol = "HTTP"
  target_type = "instance"
  vpc_id = "vpc-97acecec"
  health_check {
    protocol = "HTTP"
    path = "/healthy"
    healthy_threshold = 5
    unhealthy_threshold = 2
    timeout = 5
    interval = 30
    matcher = "200,201,401"
  }

  lifecycle {
    create_before_destroy = true
  }
}

data "aws_lb" "web-apps" {
  name = "Web-Apps"
}

data "aws_lb_listener" "http" {
  load_balancer_arn = data.aws_lb.web-apps.arn
  port = 80
}

data "aws_lb_listener" "https" {
  load_balancer_arn = data.aws_lb.web-apps.arn
  port = 443
}

resource "aws_cloudwatch_log_group" "acoustic-api" {
  name = "/ecs/acoustic-api"
  retention_in_days = 7
}

resource "aws_alb_listener_rule" "http-rule" {
  listener_arn = data.aws_lb_listener.http.arn
  priority = 100
  action {
    type = "forward"
    target_group_arn = aws_lb_target_group.target-group.arn
  }
  condition {
    host_header {
      values = ["acoustic-api.challenge.noahkovacs.me"]
    }
  }
}

resource "aws_alb_listener_rule" "https-rule" {
  listener_arn = data.aws_lb_listener.https.arn
  action {
    type = "forward"
    target_group_arn = aws_lb_target_group.target-group.arn
  }
  condition {
    host_header {
      values = ["acoustic-api.challenge.noahkovacs.me"]
    }
  }
}

resource "aws_ecs_service" "acoustic-challenge" {
  name = "acoustic-challenge-api"
  task_definition = aws_ecs_task_definition.acoustic-challenge-api.arn
  desired_count = 1
  cluster = "Production"
  launch_type = "EC2"
  load_balancer {
    container_name = "acoustic-challenge-api"
    container_port = 3000
    target_group_arn = aws_lb_target_group.target-group.arn
  }
  depends_on = [aws_lb_target_group.target-group]
}
