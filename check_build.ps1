$params = '{"commands":["cat /var/log/cloud-init-output.log | head -20"]}'
$cmdId = aws ssm send-command --instance-ids i-0cf87cb77073b6f90 --document-name "AWS-RunShellScript" --parameters $params --query "Command.CommandId" --output text
Write-Output "CommandId: $cmdId"
Start-Sleep -Seconds 5
$output = aws ssm get-command-invocation --command-id $cmdId --instance-id i-0cf87cb77073b6f90 --query "StandardOutputContent" --output text
Write-Output $output
