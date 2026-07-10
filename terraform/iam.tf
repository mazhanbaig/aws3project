data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "s3_snapshots" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket"
    ]
    resources = [
      "arn:aws:s3:::${aws_s3_bucket.snapshots.bucket}",
      "arn:aws:s3:::${aws_s3_bucket.snapshots.bucket}/*"
    ]
  }
}

resource "aws_iam_role" "ec2" {
  name               = "competitor-tracker-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = {
    Name = "competitor-tracker-ec2-role"
  }
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_policy" "s3_snapshots" {
  name   = "competitor-tracker-s3-snapshots"
  policy = data.aws_iam_policy_document.s3_snapshots.json

  tags = {
    Name = "competitor-tracker-s3-snapshots"
  }
}

resource "aws_iam_role_policy_attachment" "s3" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.s3_snapshots.arn
}

resource "aws_iam_instance_profile" "ec2" {
  name = "competitor-tracker-ec2-profile"
  role = aws_iam_role.ec2.name
}