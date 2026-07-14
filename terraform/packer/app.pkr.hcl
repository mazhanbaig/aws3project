packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "app_repo_url" {
  type    = string
  default = "https://github.com/mazhanbaig/aws3project.git"
}

variable "app_branch" {
  type    = string
  default = "main"
}

variable "api_gateway_url" {
  type    = string
  default = ""
}

variable "build_id" {
  type    = string
  default = "{{timestamp}}"
}

source "amazon-ebs" "app" {
  region        = var.aws_region
  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-x86_64"
      architecture        = "x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }
  instance_type = "t3.micro"
  ssh_username  = "ec2-user"

  ami_name        = "competitor-tracker-{{timestamp}}"
  ami_description = "Competitor Tracker app - build ${var.build_id}"
  ami_users       = []

  tags = {
    Name      = "competitor-tracker-ami"
    BuildID   = var.build_id
    BuildTime = "{{timestamp}}"
    Branch    = var.app_branch
  }

  launch_block_device_mappings {
    device_name           = "/dev/xvda"
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }
}

build {
  sources = ["source.amazon-ebs.app"]

  # Install system dependencies
  provisioner "shell" {
    inline = [
      "echo '>>> Installing system dependencies...'",
      "sudo dnf update -y",
      "sudo dnf install -y nodejs20 git",
      "node --version",
      "npm --version",
      "echo '>>> System dependencies installed.'"
    ]
  }

  # Install PM2 globally
  provisioner "shell" {
    inline = [
      "echo '>>> Installing PM2...'",
      "sudo npm install -g pm2",
      "pm2 --version",
      "echo '>>> PM2 installed.'"
    ]
  }

  # Clone and build the application
  provisioner "shell" {
    inline = [
      "echo '>>> Cloning application...'",
      "sudo rm -rf /app",
      "sudo git clone --depth 1 -b ${var.app_branch} ${var.app_repo_url} /app",
      "sudo chown -R ec2-user:ec2-user /app",
      "echo '>>> Application cloned.'"
    ]
  }

  # Create .env.production
  provisioner "shell" {
    inline = [
      "echo '>>> Creating environment file...'",
      "cat > /app/app/.env.production << 'ENVEOF'",
      "NEXT_PUBLIC_API_URL=${var.api_gateway_url}",
      "ENVEOF",
      "echo '>>> Environment file created.'"
    ]
  }

  # Install dependencies and build
  provisioner "shell" {
    inline = [
      "echo '>>> Installing npm dependencies...'",
      "cd /app/app",
      "npm install --no-audit --no-fund",
      "echo '>>> Building application...'",
      "npm run build",
      "echo '>>> Build complete.'"
    ]
  }

  # Prepare standalone output
  provisioner "shell" {
    inline = [
      "echo '>>> Preparing standalone output...'",
      "cd /app/app",
      "cp -r .next/static .next/standalone/.next/",
      "cp -r public .next/standalone/ 2>/dev/null || true",
      "cp .env.production .next/standalone/",
      "echo '>>> Standalone output prepared.'"
    ]
  }

  # Set up PM2 startup script
  provisioner "shell" {
    inline = [
      "echo '>>> Setting up PM2 startup...'",
      "sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v20.x/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user",
      "echo '>>> PM2 startup configured.'"
    ]
  }

  # Clean up
  provisioner "shell" {
    inline = [
      "echo '>>> Cleaning up...'",
      "sudo rm -rf /app/.git",
      "sudo dnf clean all",
      "echo '>>> Cleanup complete.'"
    ]
  }

  post-processor "manifest" {
    output     = "build-manifest.json"
    strip_path = true
  }
}
