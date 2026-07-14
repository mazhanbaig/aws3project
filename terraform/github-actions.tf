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
  statement {
    effect = "Allow"
    actions = [
      "ec2:DescribeInstances"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ssm:SendCommand",
      "ssm:GetCommandInvocation",
      "ssm:ListCommandInvocations"
    ]
    resources = [
      "arn:aws:ec2:${var.aws_region}:*:instance/${aws_instance.app.id}",
      "arn:aws:ssm:${var.aws_region}::document/AWS-RunShellScript"
    ]
  }

  statement {
    effect    = "Allow"
    actions   = ["ssm:GetCommandInvocation"]
    resources = ["arn:aws:ssm:${var.aws_region}:*:*"]
  }
}

resource "aws_iam_user_policy" "github_actions" {
  name   = "competitor-tracker-github-actions-policy"
  user   = aws_iam_user.github_actions.name
  policy = data.aws_iam_policy_document.github_actions.json
}
