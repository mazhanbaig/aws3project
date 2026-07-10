resource "aws_db_subnet_group" "rds" {
  name       = "competitor-tracker-rds-subnet"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_c.id]

  tags = {
    Name = "competitor-tracker-rds-subnet"
  }
}

resource "aws_db_instance" "postgres" {
  identifier         = "competitor-tracker-db"
  engine             = "postgres"
  engine_version     = "15"
  instance_class     = var.db_instance_type
  allocated_storage  = 20
  storage_type       = "gp3"
  db_name            = "competitor_tracker"
  username           = "app"
  password           = var.db_password
  db_subnet_group_name = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible = false
  skip_final_snapshot = true
  deletion_protection = false

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "competitor-tracker-db"
  }
}