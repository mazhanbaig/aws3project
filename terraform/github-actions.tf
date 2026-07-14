resource "aws_iam_user" "github_actions" {
  name = "competitor-tracker-github-actions"

  tags = {
    Name = "competitor-tracker-github-actions"
  }
}

resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

data "aws_iam_policy_document" "github_actions" {
  # EC2 Describe (for finding instances)
  statement {
    effect = "Allow"
    actions = [
      "ec2:DescribeInstances",
      "ec2:DescribeImages",
      "ec2:DescribeSnapshots"
    ]
    resources = ["*"]
  }

  # Packer AMI creation permissions
  statement {
    effect = "Allow"
    actions = [
      "ec2:RunInstances",
      "ec2:TerminateInstances",
      "ec2:StopInstances",
      "ec2:StartInstances",
      "ec2:CreateImage",
      "ec2:RegisterImage",
      "ec2:DeregisterImage",
      "ec2:DeleteSnapshot",
      "ec2:CreateSnapshot",
      "ec2:CreateTags",
      "ec2:ModifyImageAttribute"
    ]
    resources = ["*"]
  }

  # Packer describe permissions (must be separate due to AWS IAM)
  statement {
    effect = "Allow"
    actions = [
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeSubnets",
      "ec2:DescribeVpcs",
      "ec2:DescribeKeyPairs",
      "ec2:DescribeInstanceTypes",
      "ec2:DescribeImages",
      "ec2:DescribeSnapshots"
    ]
    resources = ["*"]
  }

  # SSM for deployment
  statement {
    effect = "Allow"
    actions = [
      "ssm:SendCommand",
      "ssm:GetCommandInvocation",
      "ssm:ListCommandInvocations"
    ]
    resources = [
      "arn:aws:ec2:${var.aws_region}:*:instance/*",
      "arn:aws:ssm:${var.aws_region}::document/AWS-RunShellScript"
    ]
  }

  statement {
    effect    = "Allow"
    actions   = ["ssm:GetCommandInvocation"]
    resources = ["arn:aws:ssm:${var.aws_region}:*:*/command/*"]
  }

  # ASG operations (instance refresh, describe)
  statement {
    effect = "Allow"
    actions = [
      "autoscaling:StartInstanceRefresh",
      "autoscaling:DescribeInstanceRefreshes",
      "autoscaling:DescribeAutoScalingGroups",
      "autoscaling:DescribeAutoScalingInstances",
      "autoscaling:UpdateAutoScalingGroup"
    ]
    resources = [
      "arn:aws:autoscaling:${var.aws_region}:*:autoScalingGroup:*:autoScalingGroupName/competitor-tracker-*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "autoscaling:DescribeAutoScalingGroups",
      "autoscaling:DescribeAutoScalingInstances"
    ]
    resources = ["*"]
  }

  # S3 access for build artifacts
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:DeleteObject"
    ]
    resources = [
      "arn:aws:s3:::${aws_s3_bucket.snapshots.bucket}",
      "arn:aws:s3:::${aws_s3_bucket.snapshots.bucket}/*"
    ]
  }

  # CloudFormation (for getting API Gateway URL)
  statement {
    effect = "Allow"
    actions = [
      "cloudformation:DescribeStacks"
    ]
    resources = ["*"]
  }

  # Lambda and API Gateway (for reading Terraform outputs)
  statement {
    effect = "Allow"
    actions = [
      "lambda:ListFunctions",
      "apigateway:GET"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_user_policy" "github_actions" {
  name   = "competitor-tracker-github-actions-policy"
  user   = aws_iam_user.github_actions.name
  policy = data.aws_iam_policy_document.github_actions.json
}
