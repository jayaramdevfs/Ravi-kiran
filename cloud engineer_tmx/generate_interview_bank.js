const docx = require("docx");
const fs = require("fs");

const {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, HeadingLevel, BorderStyle, PageNumber,
  NumberFormat, TabStopPosition, TabStopType, ShadingType
} = docx;

const NAVY = "1B2A4A";
const GRAY_LINE = "CCCCCC";
const FONT = "Arial";

// Helper: create a section heading
function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 400, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
    },
    children: [
      new TextRun({
        text: text,
        font: FONT,
        size: 28,
        bold: true,
        color: NAVY,
      }),
    ],
  });
}

// Helper: create a Q&A pair with separator
function createQA(qNum, question, answer) {
  const paragraphs = [];

  // Question
  paragraphs.push(
    new Paragraph({
      spacing: { before: 240, after: 80 },
      children: [
        new TextRun({
          text: `Q${qNum}: ${question}`,
          font: FONT,
          size: 22,
          bold: true,
          color: "222222",
        }),
      ],
    })
  );

  // Answer
  paragraphs.push(
    new Paragraph({
      spacing: { before: 60, after: 120 },
      children: [
        new TextRun({
          text: `A: `,
          font: FONT,
          size: 21,
          bold: true,
          color: "444444",
        }),
        new TextRun({
          text: answer,
          font: FONT,
          size: 21,
          color: "333333",
        }),
      ],
    })
  );

  // Thin gray separator line
  paragraphs.push(
    new Paragraph({
      spacing: { before: 120, after: 40 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: GRAY_LINE },
      },
      children: [],
    })
  );

  return paragraphs;
}

// ===== ALL Q&A DATA =====
const sections = [
  {
    title: "SECTION 1: AWS CORE SERVICES (15 Questions)",
    questions: [
      { q: "What is AWS IAM, and how does it work?", a: "IAM (Identity and Access Management) is AWS's service for controlling access to resources. It uses Users, Groups, Roles, and Policies. Policies are JSON documents that define permissions (Allow/Deny) for specific actions on specific resources. At TefoLogic, I configured IAM roles for EC2 instances to access S3 buckets without hardcoding credentials, following the principle of least privilege." },
      { q: "Explain the difference between Security Groups and NACLs.", a: "Security Groups are stateful firewalls at the instance level \u2014 if you allow inbound traffic, the response is automatically allowed. NACLs (Network Access Control Lists) are stateless firewalls at the subnet level \u2014 you must explicitly allow both inbound and outbound. Security Groups only have Allow rules; NACLs have both Allow and Deny rules. I used Security Groups at TefoLogic to restrict SSH access to specific IP ranges." },
      { q: "What is a VPC and why is it important?", a: "A VPC (Virtual Private Cloud) is an isolated virtual network in AWS. It gives you control over IP ranges (CIDR blocks), subnets, route tables, and gateways. You can create public subnets (with internet gateway) and private subnets (with NAT gateway). It's essential for network segmentation and security isolation \u2014 critical in financial environments like TMX." },
      { q: "Explain S3 storage classes and when you'd use each.", a: "S3 Standard for frequently accessed data, S3 Intelligent-Tiering for unknown patterns, S3 Standard-IA for infrequent but fast access, S3 Glacier for archival (minutes to hours retrieval), S3 Glacier Deep Archive for long-term compliance storage (12-hour retrieval). For TMX, trading logs might use Standard, while historical audit data would go to Glacier for cost savings." },
      { q: "What is AWS CloudTrail and how did you use it?", a: "CloudTrail records all API calls made in your AWS account \u2014 who did what, when, and from where. It's critical for security auditing and compliance. At TefoLogic, I enabled CloudTrail to monitor unauthorized access attempts and integrated logs with our SIEM for real-time threat detection. It captures management events by default and can be configured for data events (S3 object-level operations)." },
      { q: "How does AWS Lambda work and when would you use it?", a: "Lambda is a serverless compute service \u2014 you upload code and AWS handles the infrastructure. It runs in response to triggers (API Gateway, S3 events, CloudWatch Events). You pay only for execution time. Use cases: automated log processing, scheduled security scans, auto-remediation scripts. I'd use it at TMX for automated incident response \u2014 e.g., triggering a Lambda when CloudTrail detects suspicious API calls." },
      { q: "What is an Elastic Load Balancer and its types?", a: "ELB distributes incoming traffic across multiple targets. Three types: Application Load Balancer (ALB) for HTTP/HTTPS Layer 7 routing, Network Load Balancer (NLB) for TCP/UDP Layer 4 ultra-low latency, and Gateway Load Balancer (GWLB) for third-party virtual appliances. For TMX's trading platforms, NLB would be ideal for low-latency TCP traffic distribution." },
      { q: "Explain EC2 instance types and how you choose one.", a: "EC2 instances come in families: General Purpose (t3, m5) for balanced workloads, Compute Optimized (c5) for CPU-intensive tasks, Memory Optimized (r5) for databases, Storage Optimized (i3) for high I/O. You choose based on workload needs. For cost optimization, use Reserved Instances for steady-state, Spot for fault-tolerant batch jobs, and On-Demand for unpredictable loads." },
      { q: "What is AWS CloudWatch and how is it used for monitoring?", a: "CloudWatch collects metrics, logs, and events from AWS resources. You can create dashboards, set alarms (e.g., CPU > 80% triggers SNS notification), and use CloudWatch Logs for centralized log management. CloudWatch Logs Insights lets you query logs with SQL-like syntax. At TMX, I'd set up alarms for infrastructure health and integrate with PagerDuty for on-call alerts." },
      { q: "What is Route 53 and how does DNS work in AWS?", a: "Route 53 is AWS's DNS service. It provides domain registration, DNS routing, and health checking. Routing policies include Simple, Weighted (A/B testing), Latency-based (closest region), Failover (active-passive DR), and Geolocation. For TMX's multi-region setup, latency-based routing ensures traders connect to the nearest data center." },
      { q: "Explain AWS Auto Scaling.", a: "Auto Scaling adjusts the number of EC2 instances based on demand. You define scaling policies (target tracking, step scaling, or scheduled). Components: Launch Template (instance config), Auto Scaling Group (min/max/desired count), Scaling Policy (when to scale). It ensures high availability during peak trading hours and cost savings during off-hours." },
      { q: "What is AWS SNS vs SQS?", a: "SNS (Simple Notification Service) is pub/sub \u2014 one message to many subscribers (email, SMS, Lambda, SQS). SQS (Simple Queue Service) is a message queue \u2014 messages wait for a consumer to process them. Use SNS for fan-out notifications (alert multiple teams), SQS for decoupling services (process tasks asynchronously). They're often used together: SNS publishes to multiple SQS queues." },
      { q: "How do you secure data at rest and in transit on AWS?", a: "At rest: Use AWS KMS for encryption keys, enable S3 server-side encryption (SSE-S3, SSE-KMS, SSE-C), enable EBS encryption, and RDS encryption. In transit: Use TLS/SSL certificates via AWS Certificate Manager, enforce HTTPS on load balancers, use VPN or Direct Connect for private connectivity. For financial data at TMX, encryption is mandatory for compliance." },
      { q: "What is AWS Organizations and how do you manage multiple accounts?", a: "AWS Organizations lets you centrally manage multiple AWS accounts. You can group accounts into OUs (Organizational Units), apply Service Control Policies (SCPs) to restrict permissions across accounts, and consolidate billing. For TMX, separate accounts for production, staging, and security with SCPs preventing accidental resource deletion in production." },
      { q: "Explain the AWS Shared Responsibility Model.", a: "AWS is responsible for security OF the cloud (physical infrastructure, hypervisor, network). Customer is responsible for security IN the cloud (OS patching, application code, IAM policies, encryption, firewall rules). For TMX, this means AWS ensures the data center is secure, but we must properly configure VPCs, encrypt data, and manage access controls." },
    ],
  },
  {
    title: "SECTION 2: AZURE BASICS (10 Questions)",
    questions: [
      { q: "How does Azure compare to AWS? Name equivalent services.", a: "EC2 = Azure Virtual Machines, S3 = Azure Blob Storage, VPC = Azure VNet, IAM = Azure Active Directory (Entra ID), Lambda = Azure Functions, CloudWatch = Azure Monitor, RDS = Azure SQL Database, EKS = AKS (Azure Kubernetes Service), CloudFormation = ARM Templates/Bicep, Route 53 = Azure DNS." },
      { q: "What is Azure Active Directory (Entra ID)?", a: "Azure AD (now Microsoft Entra ID) is Microsoft's cloud identity and access management service. It provides SSO, MFA, conditional access policies, and RBAC. Unlike AWS IAM which is per-account, Azure AD is a tenant-level identity provider that can manage access across multiple Azure subscriptions and even third-party SaaS apps." },
      { q: "Explain Azure Resource Groups and Subscriptions.", a: "A Resource Group is a logical container for related Azure resources (VMs, databases, networks). All resources must belong to one. A Subscription is a billing boundary \u2014 an organization can have multiple subscriptions (dev, staging, prod). Management Groups sit above subscriptions for policy enforcement. It's similar to AWS Organizations + resource tagging." },
      { q: "What is Azure VNet and how does it differ from AWS VPC?", a: "Azure VNet is the networking foundation \u2014 similar to AWS VPC. Key differences: Azure uses Network Security Groups (NSGs) instead of Security Groups + NACLs (but NSGs can apply to both subnets and NICs). Azure VNet peering is simpler. Azure has built-in DDoS Protection. Both support CIDR-based addressing, subnets, and routing tables." },
      { q: "What is AKS (Azure Kubernetes Service)?", a: "AKS is Azure's managed Kubernetes service. Azure manages the control plane (API server, etcd, scheduler); you manage worker nodes. It integrates with Azure AD for RBAC, Azure Monitor for logging, and Azure Container Registry for images. Similar to AWS EKS but with tighter Azure ecosystem integration. I'd use AKS for containerized microservices deployment." },
      { q: "Explain ARM Templates.", a: "ARM (Azure Resource Manager) Templates are JSON files that define Azure infrastructure as code \u2014 similar to CloudFormation. They're declarative: you define the desired state, and Azure figures out what to create/update. Bicep is a newer, cleaner DSL that compiles to ARM templates. Both support parameterization, variables, and modular linked templates." },
      { q: "What is Azure Monitor?", a: "Azure Monitor collects metrics and logs from Azure resources. It includes Application Insights (app performance), Log Analytics (query logs with KQL), and Alerts. Similar to AWS CloudWatch. You can create dashboards, set up action groups for notifications, and integrate with PagerDuty or ServiceNow for incident management." },
      { q: "What is Azure Key Vault?", a: "Azure Key Vault securely stores secrets (API keys, passwords), encryption keys, and certificates. Applications access secrets via managed identities (no hardcoded credentials). Similar to AWS Secrets Manager + KMS. Essential for TMX to manage database passwords, API keys, and TLS certificates securely." },
      { q: "Explain Azure DevOps vs GitHub Actions for CI/CD.", a: "Azure DevOps provides Repos, Pipelines, Boards, Test Plans, and Artifacts \u2014 a complete DevOps platform. GitHub Actions is more lightweight, YAML-based, integrated with GitHub repos. Azure DevOps is better for enterprise with existing Microsoft stack. GitHub Actions is more popular for open-source and modern workflows. Both support multi-stage pipelines, approvals, and environment deployments." },
      { q: "What is Azure Policy and how does it differ from AWS SCPs?", a: "Azure Policy enforces organizational standards on resources \u2014 e.g., \"all storage accounts must use encryption\" or \"VMs can only be deployed in Canada Central.\" It can audit, deny, or auto-remediate. AWS SCPs restrict what actions accounts can perform. Azure Policy is more granular and can auto-fix non-compliant resources." },
    ],
  },
  {
    title: "SECTION 3: TERRAFORM / IaC (15 Questions)",
    questions: [
      { q: "What is Terraform and why use it?", a: "Terraform is an open-source Infrastructure as Code tool by HashiCorp. You write declarative HCL (HashiCorp Configuration Language) files to define infrastructure, and Terraform creates/modifies/destroys resources to match. Benefits: multi-cloud support (AWS + Azure + GCP), state management, plan before apply, repeatable deployments, version control. At TefoLogic, I used Terraform to provision AWS infrastructure consistently across environments." },
      { q: "Explain the Terraform workflow: init, plan, apply.", a: "terraform init \u2014 initializes the working directory, downloads providers and modules. terraform plan \u2014 shows what changes will be made without applying them (dry run). terraform apply \u2014 executes the changes. Always run plan before apply to review changes. At TefoLogic, we enforced plan output review in our CI pipeline before allowing apply." },
      { q: "What is Terraform state and why is it important?", a: "Terraform state (terraform.tfstate) is a JSON file that maps your config to real resources. It tracks resource IDs, attributes, and dependencies. Without it, Terraform can't know what exists. Best practices: store state remotely (S3 + DynamoDB for locking), never edit manually, use terraform state commands for operations. State contains sensitive data \u2014 encrypt it." },
      { q: "How do you manage Terraform state remotely?", a: "Use a backend configuration. For AWS: S3 bucket for state storage + DynamoDB table for state locking (prevents concurrent modifications). Example: backend \"s3\" { bucket = \"tfstate-bucket\", key = \"prod/terraform.tfstate\", region = \"ca-central-1\", dynamodb_table = \"tf-locks\" }. For Azure: use Azure Blob Storage with blob lease locking." },
      { q: "What are Terraform modules and why use them?", a: "Modules are reusable, self-contained packages of Terraform configuration. Instead of repeating VPC code for every environment, create a VPC module and call it with different parameters. Benefits: DRY principle, consistency, tested infrastructure patterns. You can use the public Terraform Registry or write custom modules. At TefoLogic, we used modules for standardizing network and compute resources." },
      { q: "How do you handle secrets in Terraform?", a: "Never hardcode secrets in .tf files. Options: use terraform.tfvars (gitignored), environment variables (TF_VAR_), AWS Secrets Manager/Parameter Store with data sources, HashiCorp Vault provider, or CI/CD pipeline secret injection. Mark sensitive outputs with sensitive = true. At TMX, secrets must be managed through a vault, never in version control." },
      { q: "Explain Terraform workspaces.", a: "Workspaces allow multiple state files for the same configuration \u2014 useful for managing dev/staging/prod with the same code. terraform workspace new staging, terraform workspace select prod. Each workspace has its own state. However, many teams prefer separate directories or Terragrunt for environment management as workspaces have limitations with backend configurations." },
      { q: "What happens when you run terraform destroy?", a: "It destroys all resources managed by the current Terraform state. It shows a plan first (like apply) and requires confirmation. Use -target to destroy specific resources. NEVER run in production without extreme caution. In CI/CD, you'd typically only use destroy for temporary environments (PR environments, load test infrastructure)." },
      { q: "How do you import existing resources into Terraform?", a: "terraform import <resource_type>.<name> <resource_id> \u2014 adds the resource to state. Then write the matching HCL configuration. Terraform 1.5+ supports import blocks for declarative imports. This is essential for brownfield environments where infrastructure was created manually (common scenario at organizations transitioning to IaC)." },
      { q: "What is a Terraform provider?", a: "A provider is a plugin that interacts with APIs of a cloud/service. AWS provider manages AWS resources, Azure provider for Azure, etc. You declare providers with version constraints. Each provider offers resources (create/manage) and data sources (read existing). Multiple provider instances can target different regions or accounts." },
      { q: "Explain terraform plan output and how you read it.", a: "Plan shows: + (create), - (destroy), ~ (modify in-place), -/+ (destroy and recreate). It lists every attribute change. Look for forced replacements (resource recreation) which could cause downtime. Always review plan before apply. In CI/CD, output plan to a file (terraform plan -out=plan.tfplan) and apply that exact plan." },
      { q: "What are Terraform data sources?", a: "Data sources let you fetch information about existing resources not managed by your Terraform. Example: data \"aws_ami\" \"latest\" { filter { name = \"name\", values = [\"amzn2-*\"] } } fetches the latest Amazon Linux AMI ID. Useful for referencing shared resources, latest AMI IDs, or resources managed by another team." },
      { q: "How do you handle Terraform state drift?", a: "State drift occurs when someone changes infrastructure outside Terraform. Run terraform plan regularly to detect drift. Options: terraform apply to bring infrastructure back to desired state, or terraform apply -refresh-only to update state to match reality. In CI/CD, scheduled plan runs detect drift automatically." },
      { q: "What is terraform taint and when would you use it?", a: "terraform taint (now replaced by terraform apply -replace=<resource>) marks a resource for recreation on next apply. Use when a resource is in a bad state but Terraform thinks it's fine \u2014 e.g., an EC2 instance with corrupted OS. Forces destroy + recreate cycle." },
      { q: "Explain Terraform lifecycle rules.", a: "Lifecycle blocks control resource behavior: create_before_destroy = true (zero-downtime replacement), prevent_destroy = true (safety for critical resources like databases), ignore_changes = [tags] (ignore external changes to specific attributes). Example: prevent accidental deletion of a production RDS instance." },
    ],
  },
  {
    title: "SECTION 4: KUBERNETES / EKS / AKS (15 Questions)",
    questions: [
      { q: "What is Kubernetes and why is it used?", a: "Kubernetes (K8s) is an open-source container orchestration platform. It automates deployment, scaling, and management of containerized applications. Benefits: self-healing (restarts failed containers), horizontal scaling, rolling updates with zero downtime, service discovery, and load balancing. It's the industry standard for running microservices in production." },
      { q: "Explain the key Kubernetes components.", a: "Control Plane: API Server (REST interface), etcd (key-value store for cluster state), Scheduler (assigns pods to nodes), Controller Manager (maintains desired state). Worker Nodes: kubelet (node agent), kube-proxy (networking), Container Runtime (Docker/containerd). Users interact via kubectl to the API Server." },
      { q: "What is a Pod in Kubernetes?", a: "A Pod is the smallest deployable unit \u2014 one or more containers sharing network and storage. Containers in a pod share the same IP address and can communicate via localhost. Pods are ephemeral \u2014 they can be replaced at any time. You rarely create pods directly; instead use Deployments or StatefulSets to manage them." },
      { q: "What is a Deployment and how does it work?", a: "A Deployment manages ReplicaSets, which manage Pods. You declare desired state (image, replicas, resources) and Kubernetes maintains it. Key features: rolling updates (gradually replace old pods), rollback (kubectl rollout undo), scaling (kubectl scale deployment --replicas=5). It's the most common way to run stateless applications." },
      { q: "Explain Kubernetes Services and their types.", a: "Services provide stable networking for pods. Types: ClusterIP (internal only, default), NodePort (exposes on each node's IP:port), LoadBalancer (provisions cloud load balancer \u2014 used in EKS/AKS), ExternalName (DNS alias). Services use label selectors to route traffic to matching pods. Without services, you can't reliably reach pods because their IPs change." },
      { q: "What is a Namespace in Kubernetes?", a: "Namespaces provide logical isolation within a cluster. Default namespaces: default, kube-system, kube-public. Use them to separate environments (dev, staging) or teams. You can apply resource quotas and network policies per namespace. Example: limit the dev namespace to 10 CPU cores and 32GB RAM." },
      { q: "What is AWS EKS?", a: "EKS (Elastic Kubernetes Service) is AWS's managed Kubernetes. AWS manages the control plane (HA across 3 AZs). You manage worker nodes (EC2 or Fargate for serverless). Integrates with AWS services: IAM for RBAC, ALB Ingress Controller, EBS/EFS for storage, CloudWatch for logging. Use eksctl or Terraform to provision clusters." },
      { q: "What is AKS and how does it compare to EKS?", a: "AKS (Azure Kubernetes Service) is Azure's managed K8s. Azure manages the control plane for free (you only pay for worker nodes). Key differences from EKS: Azure AD integration for RBAC (vs IAM), Azure CNI networking (vs VPC CNI), Azure Monitor (vs CloudWatch). AKS has simpler setup; EKS has deeper AWS ecosystem integration." },
      { q: "How do you deploy an application on Kubernetes?", a: "1) Build Docker image and push to registry (ECR/ACR). 2) Write Deployment YAML (image, replicas, resource limits). 3) Write Service YAML (type: LoadBalancer for external access). 4) Apply: kubectl apply -f deployment.yaml -f service.yaml. 5) Verify: kubectl get pods, kubectl get svc. 6) For updates: change image tag and reapply \u2014 rolling update happens automatically." },
      { q: "What are ConfigMaps and Secrets?", a: "ConfigMaps store non-sensitive configuration (environment variables, config files). Secrets store sensitive data (passwords, API keys) \u2014 base64 encoded (not encrypted by default, enable encryption at rest). Both can be mounted as volumes or injected as environment variables. Example: database connection string in a Secret, app feature flags in a ConfigMap." },
      { q: "Explain Kubernetes Ingress.", a: "Ingress manages external HTTP/HTTPS access to services. It provides SSL termination, name-based virtual hosting, and path-based routing. You need an Ingress Controller (NGINX, AWS ALB, Traefik) to process Ingress rules. Example: route /api to backend service, /app to frontend service, with TLS certificate." },
      { q: "What is Helm and why is it used?", a: "Helm is the package manager for Kubernetes \u2014 like apt/yum for Linux. Helm Charts are packages of pre-configured K8s resources. Benefits: templating (one chart for multiple environments), versioning, easy rollbacks, dependency management. Example: helm install prometheus prometheus-community/prometheus deploys a full monitoring stack." },
      { q: "How does horizontal pod autoscaling work?", a: "HPA automatically adjusts pod replicas based on CPU/memory utilization or custom metrics. Example: kubectl autoscale deployment myapp --cpu-percent=70 --min=2 --max=10 \u2014 scales between 2-10 pods, targeting 70% CPU. It checks metrics every 15 seconds by default. Requires Metrics Server. For TMX, HPA ensures trading platforms handle peak loads." },
      { q: "What is a StatefulSet and when do you use it?", a: "StatefulSet manages stateful applications that need stable network identities, persistent storage, and ordered deployment. Unlike Deployments, pods get predictable names (app-0, app-1, app-2) and each gets its own PersistentVolumeClaim. Use for databases (PostgreSQL, MongoDB), message queues (Kafka), and distributed systems that need stable identifiers." },
      { q: "How do you troubleshoot a pod that won't start?", a: "Steps: 1) kubectl describe pod <name> \u2014 check Events section for errors. 2) kubectl logs <pod> \u2014 check application logs. 3) Common issues: ImagePullBackOff (wrong image name/registry auth), CrashLoopBackOff (app crashing \u2014 check logs), Pending (insufficient resources \u2014 check node capacity), OOMKilled (memory limit too low). 4) kubectl exec -it <pod> -- /bin/sh for interactive debugging." },
    ],
  },
  {
    title: "SECTION 5: NETWORKING & SECURITY (15 Questions)",
    questions: [
      { q: "Explain the OSI model layers relevant to cloud networking.", a: "Layer 3 (Network): IP addressing, routing \u2014 VPC, subnets, route tables. Layer 4 (Transport): TCP/UDP \u2014 Security Groups, NLB. Layer 7 (Application): HTTP/HTTPS \u2014 ALB, WAF, API Gateway. Understanding layers helps troubleshoot: if you can ping (L3) but can't connect to a port (L4), check Security Groups. If port works but HTTP fails (L7), check application or ALB rules." },
      { q: "What is a VPN and how does it work?", a: "VPN (Virtual Private Network) creates an encrypted tunnel over the internet. Types: Site-to-Site VPN (connects on-premises network to cloud VPC \u2014 uses IPSec), Client VPN (individual users connect to VPC). AWS provides VPN Gateway for site-to-site and Client VPN Endpoint. For TMX, site-to-site VPN connects the office network to AWS VPC securely." },
      { q: "Explain CIDR notation with examples.", a: "CIDR (Classless Inter-Domain Routing) defines IP ranges. Format: IP/prefix. /24 = 256 IPs (10.0.1.0/24 = 10.0.1.0-10.0.1.255), /16 = 65,536 IPs, /32 = single IP. For VPC: use /16 for the VPC (10.0.0.0/16), /24 for subnets. Rule of thumb: smaller prefix = more IPs. Don't overlap CIDR blocks between VPCs that need peering." },
      { q: "What is the difference between public and private subnets?", a: "Public subnet: has a route to Internet Gateway (0.0.0.0/0 \u2192 IGW). Resources get public IPs and can be reached from the internet. Private subnet: no direct internet access. Uses NAT Gateway for outbound internet (patches, API calls) but isn't reachable from outside. Best practice: put databases and app servers in private subnets, only load balancers in public subnets." },
      { q: "Explain DNS and how resolution works.", a: "DNS translates domain names to IP addresses. Resolution: Browser \u2192 Local DNS cache \u2192 Recursive Resolver \u2192 Root Server (.com) \u2192 TLD Server \u2192 Authoritative Name Server \u2192 IP returned. Record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (verification), NS (name servers). TTL (Time to Live) controls caching duration." },
      { q: "What is a firewall and how does it work in cloud?", a: "A firewall controls network traffic based on rules. In cloud: Security Groups (instance-level, stateful), NACLs (subnet-level, stateless), WAF (web application firewall \u2014 Layer 7 protection against SQL injection, XSS), AWS Network Firewall (advanced inspection). For TMX, defense-in-depth: WAF on ALB + Security Groups on instances + NACLs on subnets." },
      { q: "What is TLS/SSL and how does it work?", a: "TLS (Transport Layer Security) encrypts data in transit. Process: Client Hello \u2192 Server presents certificate \u2192 Key exchange \u2192 Encrypted session. Certificates are issued by Certificate Authorities (CAs). AWS Certificate Manager provides free TLS certificates for ALB, CloudFront. For TMX, TLS 1.2+ is mandatory for all financial data transmission." },
      { q: "Explain the concept of Zero Trust networking.", a: "Zero Trust = \"never trust, always verify.\" No user or device is trusted by default, even inside the network. Principles: verify identity for every request, enforce least privilege, micro-segmentation, continuous monitoring, assume breach. Implementation: MFA everywhere, per-service authentication, encrypted internal traffic, identity-based access. Critical for financial services like TMX." },
      { q: "What is a WAF and when would you use it?", a: "Web Application Firewall protects against Layer 7 attacks: SQL injection, XSS, DDoS, bot traffic. AWS WAF integrates with ALB, CloudFront, API Gateway. You define rules (rate limiting, IP blocking, regex patterns). Managed rule groups available (OWASP Top 10, Bot Control). For TMX, WAF protects trading APIs from malicious requests." },
      { q: "How do you troubleshoot network connectivity issues in cloud?", a: "Systematic approach: 1) Check Security Groups (inbound/outbound rules). 2) Check NACLs (subnet-level rules). 3) Check Route Tables (correct routes to IGW/NAT/peering). 4) Check DNS resolution (nslookup, dig). 5) Use VPC Flow Logs to see accepted/rejected traffic. 6) Use AWS Reachability Analyzer for path analysis. 7) Verify the application is listening on the correct port." },
      { q: "What is VPC Peering?", a: "VPC Peering connects two VPCs so they can communicate using private IPs. Traffic stays on AWS backbone (doesn't traverse internet). Requirements: non-overlapping CIDR blocks, update route tables in both VPCs. Limitations: non-transitive (A-B and B-C doesn't mean A-C), no edge-to-edge routing. For multi-VPC architectures, consider AWS Transit Gateway instead." },
      { q: "What is a NAT Gateway and why is it needed?", a: "NAT (Network Address Translation) Gateway allows resources in private subnets to access the internet (for updates, API calls) without being directly reachable from the internet. It translates private IPs to a public Elastic IP. Place NAT Gateway in public subnet. It's managed by AWS (highly available in an AZ). Cost consideration: NAT Gateway charges per GB processed." },
      { q: "Explain the principle of least privilege.", a: "Grant only the minimum permissions needed to perform a task \u2014 nothing more. In AWS IAM: start with no permissions, add specific actions on specific resources. Use conditions to further restrict (e.g., only from specific IP ranges). Regular access reviews to remove unused permissions. AWS Access Analyzer helps identify overly permissive policies. Critical in financial environments like TMX." },
      { q: "What are Security Groups best practices?", a: "1) Default deny \u2014 only allow what's needed. 2) Use descriptive names and tags. 3) Restrict SSH/RDP to specific IPs, never 0.0.0.0/0. 4) Reference other security groups instead of IP ranges where possible. 5) Separate SGs by function (web, app, database). 6) Review and audit regularly. 7) Use VPC Flow Logs to verify traffic patterns match expectations." },
      { q: "What is AWS Direct Connect?", a: "Direct Connect provides a dedicated private network connection from your on-premises data center to AWS. Benefits over VPN: higher bandwidth (1-100 Gbps), lower latency, more consistent performance. For TMX, Direct Connect ensures low-latency connectivity between the exchange's data center and AWS for real-time trading data processing." },
    ],
  },
  {
    title: "SECTION 6: CI/CD PIPELINES (10 Questions)",
    questions: [
      { q: "What is CI/CD and why is it important?", a: "CI (Continuous Integration): developers frequently merge code to main branch; automated builds and tests run on every merge. CD (Continuous Delivery/Deployment): automatically deploy tested code to staging/production. Benefits: faster releases, fewer bugs, consistent deployments, quick rollbacks. At TefoLogic, CI/CD reduced deployment time from hours to minutes." },
      { q: "Describe a typical CI/CD pipeline.", a: "Stages: 1) Source \u2014 code push triggers pipeline (Git webhook). 2) Build \u2014 compile code, build Docker image. 3) Test \u2014 unit tests, integration tests, security scans. 4) Staging \u2014 deploy to staging environment, run smoke tests. 5) Approval \u2014 manual gate for production. 6) Production \u2014 deploy with rolling/blue-green/canary strategy. 7) Monitor \u2014 check metrics and alerts post-deployment." },
      { q: "What CI/CD tools have you used?", a: "At TefoLogic, I used GitHub Actions for CI/CD. Pipeline stages: code push \u2192 linting \u2192 unit tests \u2192 Docker build \u2192 push to ECR \u2192 Terraform plan \u2192 manual approval \u2192 Terraform apply \u2192 deploy to EKS. I also have experience with Jenkins (pipeline as code with Jenkinsfile) and understand GitLab CI, Azure DevOps Pipelines, and AWS CodePipeline." },
      { q: "Explain blue-green vs canary deployments.", a: "Blue-Green: two identical environments. Blue (current production) and Green (new version). Switch traffic all at once (DNS or load balancer). Instant rollback by switching back. Canary: gradually route a small percentage of traffic (5%, then 25%, then 100%) to the new version. Monitor for errors at each stage. Canary is safer but slower; blue-green is faster but needs double infrastructure." },
      { q: "How do you handle rollbacks in CI/CD?", a: "Strategies: 1) Blue-green: switch load balancer back to previous environment. 2) Kubernetes: kubectl rollout undo deployment/<name>. 3) Terraform: revert git commit and re-apply previous state. 4) Docker: redeploy previous image tag. Key: always keep previous version available, tag all releases, test rollback procedures regularly. Automated rollback on health check failures." },
      { q: "What is GitOps?", a: "GitOps uses Git as the single source of truth for infrastructure and application state. Changes are made via pull requests, reviewed, merged, and automatically applied. Tools: ArgoCD, Flux for Kubernetes. Benefits: audit trail (git history), easy rollbacks (git revert), consistent environments, developer-friendly workflows. It's declarative \u2014 the system converges to the desired state defined in Git." },
      { q: "How do you secure a CI/CD pipeline?", a: "1) Never store secrets in code \u2014 use pipeline secret management. 2) Run SAST/DAST scans in pipeline. 3) Scan Docker images for vulnerabilities (Trivy, Snyk). 4) Enforce code review before merge. 5) Use least-privilege service accounts for deployments. 6) Sign artifacts and verify signatures. 7) Audit pipeline access and logs. 8) Pin dependency versions." },
      { q: "What is Infrastructure as Code testing?", a: "Testing IaC before deployment: 1) Static Analysis: tflint, checkov for security misconfigurations. 2) Unit Tests: Terratest (Go), pytest with moto (mock AWS). 3) Plan Review: terraform plan for change preview. 4) Policy as Code: OPA/Sentinel to enforce rules (e.g., no public S3 buckets). 5) Integration Tests: deploy to test environment, validate, destroy. At TefoLogic, we used checkov in our CI pipeline." },
      { q: "Explain GitHub Actions workflows.", a: "YAML-based CI/CD in .github/workflows/. Triggered by events (push, PR, schedule, manual). Structure: workflow \u2192 jobs (run in parallel by default) \u2192 steps (run sequentially). Uses Actions (reusable units) from the marketplace. Example: on push to main \u2192 build Docker image \u2192 run tests \u2192 deploy to EKS. Supports matrix builds, caching, artifacts, and environment secrets." },
      { q: "What is a Docker multi-stage build?", a: "A Dockerfile with multiple FROM statements. Build stage compiles code with full SDK/tools; final stage copies only the built artifact into a minimal base image (alpine, distroless). Benefits: smaller images (100MB vs 1GB), fewer vulnerabilities, faster pulls. Example: Stage 1 builds Python app with all build dependencies; Stage 2 copies only the app and runtime into python:slim." },
    ],
  },
  {
    title: "SECTION 7: LINUX & SCRIPTING (10 Questions)",
    questions: [
      { q: "What Linux commands do you use daily?", a: "File operations: ls, cd, cp, mv, rm, find, chmod, chown. Text: cat, grep, awk, sed, head, tail. System: top/htop, df, du, free, ps, systemctl. Network: netstat/ss, curl, dig, ping, traceroute, tcpdump. Logs: journalctl, tail -f /var/log/syslog. Process: kill, nohup, &, jobs. Package: apt/yum. I'm comfortable with bash scripting for automation." },
      { q: "How do you troubleshoot a slow Linux server?", a: "Systematic approach: 1) top/htop \u2014 check CPU, memory, load average. 2) df -h \u2014 check disk space. 3) free -m \u2014 check memory/swap usage. 4) iostat \u2014 check disk I/O bottleneck. 5) netstat -tlnp \u2014 check listening ports and connections. 6) Check logs: /var/log/syslog, journalctl -xe. 7) ps aux --sort=-%mem \u2014 find memory-hungry processes. 8) Check if OOM killer is active in dmesg." },
      { q: "Explain file permissions in Linux.", a: "Permissions: read (r=4), write (w=2), execute (x=1) for owner, group, others. chmod 755 file.sh = rwxr-xr-x (owner: full, others: read+execute). chown user:group file changes ownership. Special: setuid (run as owner), setgid (run as group), sticky bit (only owner can delete in shared dirs like /tmp). Use ls -la to view permissions." },
      { q: "How do you write a Bash script for automation?", a: "Start with #!/bin/bash, use variables ($VAR), conditionals (if/then/fi), loops (for/while), functions. Best practices: set -e (exit on error), set -o pipefail, quote variables (\"$VAR\"), use meaningful names, add error handling, log output. At TefoLogic, I wrote Bash scripts for automated log rotation and backup verification. In my SOAR-Lite project, the pipeline automation demonstrates similar scripting principles." },
      { q: "What is cron and how do you schedule jobs?", a: "Cron runs scheduled commands. crontab -e to edit. Format: minute hour day month weekday command. Example: 0 2 * * * /backup.sh runs at 2 AM daily. */5 * * * * every 5 minutes. Use crontab -l to list. For cloud: use AWS CloudWatch Events/EventBridge rules or Azure Automation Runbooks instead of local cron." },
      { q: "Explain Python scripting for cloud automation.", a: "Python with boto3 (AWS SDK) for cloud automation. Examples: list untagged EC2 instances, create AMI snapshots, clean up old EBS volumes, rotate IAM access keys. My SOC Threat Detection project uses Python for log parsing with regex, threat analysis with datetime logic, and JSON report generation. Python is my strongest scripting language \u2014 I can automate most cloud operations tasks." },
      { q: "What is systemd and how do you manage services?", a: "systemd is the Linux init system and service manager. Commands: systemctl start/stop/restart/status nginx, systemctl enable nginx (start on boot), journalctl -u nginx (view service logs). Unit files in /etc/systemd/system/ define services. You can create custom services for your applications. Use systemctl daemon-reload after editing unit files." },
      { q: "How do you analyze log files in Linux?", a: "Tools: grep for pattern search, awk for field extraction, sed for text transformation, sort | uniq -c | sort -rn for frequency analysis, tail -f for live monitoring. My SOC Threat Detection project does exactly this programmatically \u2014 it parses auth.log files using regex to extract timestamps, IPs, users, and login status, then applies detection rules." },
      { q: "What is SSH and how do you secure it?", a: "SSH (Secure Shell) provides encrypted remote access. Security best practices: disable root login (PermitRootLogin no), use key-based auth (disable passwords), change default port, use fail2ban for brute force protection, restrict access with AllowUsers/AllowGroups, use SSH agent forwarding carefully. In AWS, use Session Manager as a more secure alternative (no open port 22 needed)." },
      { q: "Explain the difference between Bash, PowerShell, and Python for automation.", a: "Bash: best for Linux system tasks, file operations, piping commands. Fast for one-liners. PowerShell: best for Windows/Azure administration, object-oriented output, .NET integration. Python: best for complex logic, API interactions (boto3, azure-sdk), data processing, cross-platform. For cloud engineering at TMX, I'd use all three: Bash for Linux ops, PowerShell for Azure/AD tasks, Python for complex automation." },
    ],
  },
  {
    title: "SECTION 8: INCIDENT RESPONSE & MONITORING (10 Questions)",
    questions: [
      { q: "What is incident response and what are its phases?", a: "NIST Incident Response Framework: 1) Preparation \u2014 tools, runbooks, training. 2) Detection & Analysis \u2014 SIEM alerts, log analysis, triage. 3) Containment \u2014 isolate affected systems (short-term: block IP; long-term: patch). 4) Eradication \u2014 remove threat, fix root cause. 5) Recovery \u2014 restore systems, verify clean state. 6) Lessons Learned \u2014 post-incident review, update runbooks. My SOAR-Lite project automates phases 2-4." },
      { q: "How does your SOC Threat Detection project relate to real-world monitoring?", a: "It mimics a SIEM's core function: ingest logs \u2192 parse \u2192 apply detection rules \u2192 generate alerts. Real-world SIEMs (Splunk, ELK) do this at scale with more data sources. My project detects three real threat patterns: brute force attacks (10+ failed logins/5min window), suspicious logins (new IP for known user), and abnormal login times (outside 8AM-6PM). These are the same detections a SOC analyst configures in production SIEMs." },
      { q: "What is a SIEM and how does it work?", a: "SIEM (Security Information and Event Management) collects and correlates logs from multiple sources (servers, firewalls, applications) to detect security threats. Components: log collection, normalization, correlation rules, alerting, dashboards, incident tracking. Tools: Splunk, ELK Stack (Elasticsearch, Logstash, Kibana), Microsoft Sentinel, IBM QRadar. I have experience with Splunk and ELK on my resume." },
      { q: "Explain what on-call rotation means and how you'd handle it.", a: "On-call means being available 24/7 during your rotation to respond to alerts. Process: alert fires (PagerDuty/OpsGenie) \u2192 acknowledge within SLA (e.g., 5 min) \u2192 triage severity \u2192 follow runbook \u2192 escalate if needed \u2192 resolve \u2192 document. Best practices: clear runbooks for common issues, proper escalation paths, blameless post-mortems, fair rotation distribution. I'm comfortable with on-call responsibility." },
      { q: "What is root cause analysis (RCA)?", a: "RCA identifies the fundamental cause of an incident, not just symptoms. Techniques: 5 Whys (keep asking \"why\" until root cause), Fishbone Diagram (categorize potential causes), Timeline Analysis (sequence of events). Document: what happened, impact, root cause, remediation, preventive measures. RCA should be blameless \u2014 focus on systems and processes, not individuals." },
      { q: "How would you set up monitoring for cloud infrastructure?", a: "Layered approach: 1) Infrastructure: CloudWatch/Azure Monitor for CPU, memory, disk, network. 2) Application: APM tools (Datadog, New Relic) for response times, error rates. 3) Logs: Centralized logging (ELK, CloudWatch Logs) with alerts. 4) Uptime: Synthetic monitoring (ping endpoints every minute). 5) Dashboards: Grafana for visualization. 6) Alerting: PagerDuty integration with severity-based routing." },
      { q: "What is the difference between monitoring, observability, and alerting?", a: "Monitoring: collecting predefined metrics and checking thresholds (reactive). Observability: understanding system behavior from its outputs \u2014 metrics, logs, traces (proactive, can diagnose unknown problems). Alerting: notifications when thresholds are breached. Good observability means you can answer questions you haven't asked yet. For TMX, all three layers are needed for mission-critical trading infrastructure." },
      { q: "How does your SOAR-Lite project demonstrate automation skills?", a: "SOAR-Lite automates the full security pipeline: 1) Log Collection \u2014 ingests auth logs into SQLite database. 2) Detection \u2014 applies JSON-configurable rules (brute force, suspicious IP, unusual login time). 3) Automated Response \u2014 BLOCK_IP action automatically blocks malicious IPs. 4) Dashboard \u2014 Flask web UI for real-time monitoring. 5) Reporting \u2014 CSV export for incident documentation. This mirrors real SOAR platforms like Splunk SOAR, Palo Alto XSOAR." },
      { q: "What metrics would you monitor for a financial trading platform?", a: "Latency: API response times (must be sub-millisecond for trading). Availability: 99.99%+ uptime (4.32 minutes downtime/month max). Error rates: 4xx/5xx errors. Throughput: transactions per second. Infrastructure: CPU, memory, disk I/O, network bandwidth. Security: failed login attempts, unusual API patterns. Compliance: audit log completeness, encryption status. Cost: daily/monthly cloud spend vs budget." },
      { q: "How do you handle alert fatigue?", a: "1) Tune thresholds \u2014 reduce false positives. 2) Correlate alerts \u2014 group related alerts into incidents. 3) Prioritize by severity \u2014 only page for critical issues. 4) Automate responses for known issues (like SOAR-Lite does). 5) Regular review of alert rules. 6) Suppress flapping alerts. 7) Use severity levels: P1 (page immediately), P2 (respond within 30 min), P3 (next business day), P4 (backlog)." },
    ],
  },
  {
    title: "SECTION 9: BEHAVIORAL / SITUATIONAL (15 Questions \u2014 STAR Format)",
    questions: [
      { q: "Tell me about yourself.", a: "Use the 60-second script from Self-Introduction document." },
      { q: "Why do you want to work at TMX Group?", a: "TMX operates Canada's critical financial infrastructure \u2014 the Toronto Stock Exchange, TSX Venture Exchange, and Montreal Exchange. Cloud engineering here directly impacts market integrity and millions of investors. My security background combined with cloud skills is a unique fit \u2014 I understand both infrastructure scalability AND the security requirements of financial systems. Plus, TMX's cloud modernization journey means I'd be contributing to meaningful transformation, not just maintaining legacy systems." },
      { q: "Why should we hire you?", a: "Three reasons: 1) I bridge security and cloud \u2014 I have cybersecurity operations training AND cloud engineering experience, which means I build secure infrastructure from day one, not as an afterthought. 2) I've done this work in production \u2014 at TefoLogic, I deployed AWS infrastructure with Terraform, configured CI/CD pipelines, and managed IAM policies. 3) I'm a builder \u2014 my two projects (SOC Threat Detection and SOAR-Lite) demonstrate I don't just use tools, I build automated solutions. For TMX's mission-critical infrastructure, you need someone who thinks security first and automates everything." },
      { q: "Tell me about a challenging project you worked on. (STAR)", a: "Situation: At TefoLogic, we needed to migrate a client's application from manual AWS deployment to infrastructure-as-code. Task: I was responsible for writing Terraform configurations for the entire stack \u2014 VPC, EC2, RDS, S3, and IAM roles. Action: I designed a modular Terraform structure, implemented remote state with S3 backend, created separate workspaces for dev/staging/prod, and set up a CI/CD pipeline with GitHub Actions for automated plan/apply. Result: Deployment time reduced from 2 hours manual to 15 minutes automated, with zero configuration drift between environments." },
      { q: "Describe a time you solved a difficult technical problem. (STAR)", a: "Situation: While building my SOC Threat Detection project, the brute force detection was generating false positives \u2014 legitimate users who mistyped passwords were being flagged. Task: I needed accurate detection without overwhelming analysts with noise. Action: I implemented a sliding time window (5 minutes) instead of a flat count, so 10 failed attempts had to occur within 5 minutes to trigger. I also tracked per-IP instead of per-user to catch distributed attacks. Result: False positive rate dropped significantly while maintaining detection of actual brute force patterns \u2014 the same approach used by production SIEMs." },
      { q: "How do you handle working under pressure?", a: "I prioritize and stay systematic. During my cybersecurity program at York University, I had multiple projects with overlapping deadlines \u2014 the SOC Threat Detection and SOAR-Lite projects both needed simultaneous attention. I broke each project into milestones, focused on the most critical components first (detection engine before dashboard), and used version control to track progress. Both projects were completed on time with full functionality. For on-call situations, I follow runbooks and escalation procedures rather than panicking." },
      { q: "Tell me about a time you worked in a team. (STAR)", a: "Situation: At TefoLogic, our team of 5 needed to set up a multi-account AWS environment for a client. Task: I was responsible for the networking and security components while others handled compute and database. Action: I designed the VPC architecture, configured VPN connectivity, set up Security Groups and NACLs, and coordinated with the compute team to ensure their EC2 instances could communicate across subnets. We used daily standups and shared Terraform state to avoid conflicts. Result: Successfully deployed a secure, multi-tier architecture on time, with clear network segmentation that passed the client's security audit." },
      { q: "Where do you see yourself in 5 years?", a: "In 5 years, I want to be a Senior Cloud Engineer or Cloud Architect, designing multi-region, highly available infrastructure for mission-critical systems. I plan to earn AWS Solutions Architect Professional and potentially CKA (Certified Kubernetes Administrator) certifications. At TMX, I'd love to grow into a role where I'm designing the cloud strategy, mentoring junior engineers, and contributing to the architectural decisions for Canada's financial infrastructure." },
      { q: "What is your biggest weakness?", a: "I sometimes spend too much time optimizing before shipping \u2014 I want the infrastructure to be perfect before deploying. I've learned to balance this by adopting an iterative approach: deploy a working solution first, then optimize in subsequent sprints. For example, in my SOAR-Lite project, I initially wanted to build a real-time streaming pipeline but realized a batch processing approach met the immediate needs. I shipped the working version first and documented optimization plans for future iterations." },
      { q: "How do you stay updated with cloud technologies?", a: "I follow a structured approach: AWS/Azure official blogs and re:Invent sessions, r/devops and r/aws on Reddit, The Cloud Cast podcast, hands-on labs on AWS Skill Builder, and reading documentation for new services. I'm currently finishing my Post-Grad in CloudOps which keeps me current. I also build projects to learn \u2014 my SOAR-Lite platform was built to understand end-to-end security automation." },
      { q: "Tell me about a time you had to learn something quickly. (STAR)", a: "Situation: When I started at TefoLogic, the team was using Terraform which I had only used in labs. Task: I needed to become productive with Terraform within 2 weeks to contribute to a client project. Action: I spent evenings completing HashiCorp's official tutorials, then studied our existing Terraform modules to understand patterns. I started with small changes (adding tags, modifying security groups) and progressively took on larger tasks (creating new modules). Result: Within 3 weeks, I was independently writing Terraform for new infrastructure and even improved our module structure with better variable defaults." },
      { q: "How do you handle disagreements with team members?", a: "I focus on data and outcomes, not opinions. If I disagree on a technical approach, I'll present my reasoning with evidence \u2014 performance benchmarks, documentation references, or proof-of-concept code. I'm open to being wrong and learning from others. At TefoLogic, I disagreed with a colleague about VPC design. We each drew our architecture, compared trade-offs, and ultimately combined the best elements of both approaches. The key is that disagreement should improve the solution." },
      { q: "Describe your experience with documentation.", a: "I believe in documentation that reduces future questions. My approach: README files for every project (both my GitHub projects have detailed READMEs), runbooks for operational procedures, architecture diagrams for infrastructure, and inline comments for non-obvious code logic. At TefoLogic, I documented our Terraform modules and CI/CD pipeline setup. Good documentation is especially critical for on-call engineers who need to resolve issues at 3 AM." },
      { q: "How do you prioritize tasks when everything seems urgent?", a: "I use severity and impact: 1) Production down = drop everything. 2) Security vulnerability = immediate after production issues. 3) Customer-facing issues = same day. 4) Internal improvements = scheduled in sprints. I communicate clearly about trade-offs \u2014 if I'm pulled to a P1 incident, I update stakeholders about delayed tasks. I also distinguish between \"urgent\" and \"important\" \u2014 not every request that feels urgent actually is." },
      { q: "Tell me about a mistake you made and what you learned. (STAR)", a: "Situation: During a Terraform deployment at TefoLogic, I applied changes to the wrong workspace \u2014 I was in staging but thought I was in dev. Task: Fortunately, the changes were additive (new security group rules) not destructive. Action: I immediately identified the issue, reverted the changes in staging, and applied them to the correct environment. I then implemented workspace indicators in our CI/CD pipeline that clearly display the target environment and require explicit confirmation. Result: No damage occurred, and the safeguard I added prevented similar mistakes for the entire team going forward." },
    ],
  },
  {
    title: "SECTION 10: TMX-SPECIFIC / FINANCIAL INDUSTRY (10 Questions)",
    questions: [
      { q: "What does TMX Group do?", a: "TMX Group operates Canada's primary capital markets infrastructure: Toronto Stock Exchange (TSX) \u2014 senior equities, TSX Venture Exchange (TSXV) \u2014 growth companies, Montreal Exchange (MX) \u2014 derivatives, Canadian Depository for Securities (CDS) \u2014 clearing and settlement, Trayport \u2014 energy trading technology, TMX Datalinx \u2014 market data. TMX enables billions of dollars in daily trading and is critical national financial infrastructure." },
      { q: "Why is cloud engineering critical for a stock exchange?", a: "Stock exchanges need extreme reliability (downtime = market disruption), low latency (milliseconds matter for trading), massive scalability (handle market surges during volatility), strong security (financial data protection), and strict compliance (regulatory requirements). Cloud engineering enables elastic scaling for peak trading, disaster recovery across regions, automated security monitoring, and cost-efficient data processing for market analytics." },
      { q: "What compliance frameworks are relevant to TMX?", a: "OSFI (Office of the Superintendent of Financial Institutions) guidelines, PCI-DSS for payment data, SOC 2 for service organization controls, CSA Cloud Controls Matrix, PIPEDA for privacy, ISO 27001 for information security management. Cloud infrastructure must be designed with these in mind \u2014 encryption at rest/in transit, audit logging, access controls, data residency in Canada (ca-central-1 region)." },
      { q: "How would you ensure high availability for TMX's cloud infrastructure?", a: "Multi-AZ deployments (at minimum 2 Availability Zones), load balancing across AZs, auto-scaling for traffic spikes, RDS Multi-AZ for database failover, S3 cross-region replication for critical data, Route 53 health checks with failover routing, regular DR testing, infrastructure-as-code for rapid rebuilding, monitoring with sub-minute alerting. Target 99.99% uptime for trading systems." },
      { q: "How would you handle a security incident on TMX's cloud infrastructure?", a: "Follow NIST IR framework: 1) Detection: CloudTrail + GuardDuty + SIEM alerts identify anomaly. 2) Triage: Assess severity \u2014 is trading affected? 3) Contain: Isolate compromised resources (modify security groups, revoke credentials). 4) Investigate: Analyze CloudTrail logs, VPC Flow Logs, application logs. 5) Eradicate: Patch vulnerability, rotate credentials. 6) Recover: Restore from known-good state. 7) Report: Document incident, notify OSFI if required, update runbooks. My SOAR-Lite project automates steps 1-3." },
      { q: "What is data residency and why does it matter for TMX?", a: "Data residency means data must be stored and processed within specific geographic boundaries. For TMX, Canadian financial regulations may require data to stay in Canada. AWS ca-central-1 (Montreal) region meets this requirement. Considerations: ensure backups also stay in Canada, verify that AWS services used actually process data in the chosen region, implement AWS Organization SCPs to prevent resource creation outside approved regions." },
      { q: "How would you optimize cloud costs for TMX?", a: "1) Reserved Instances/Savings Plans for predictable workloads (trading systems running 24/7). 2) Spot Instances for batch processing (market data analysis). 3) Right-sizing: use AWS Compute Optimizer to find over-provisioned instances. 4) Auto-scaling to match trading hours (scale down after market close). 5) S3 lifecycle policies to move old data to Glacier. 6) Monitor with AWS Cost Explorer and set billing alerts. 7) Tag resources by team/project for cost allocation." },
      { q: "What is disaster recovery and what strategies would you use?", a: "DR strategies (increasing cost/decreasing RTO): 1) Backup & Restore: cheapest, longest RTO (hours). Regular backups to S3, restore when needed. 2) Pilot Light: core systems always running, scale up during disaster. 3) Warm Standby: scaled-down replica always running, scale up. 4) Multi-Site Active-Active: full redundancy, near-zero RTO. For TMX trading: warm standby minimum, active-active for critical trading systems. RPO (data loss tolerance) should be near-zero for financial transactions." },
      { q: "How do you ensure compliance in cloud deployments?", a: "1) AWS Config rules for continuous compliance monitoring. 2) CloudTrail for audit logging (all API calls). 3) AWS Security Hub for security posture overview. 4) GuardDuty for threat detection. 5) Encryption everywhere (KMS-managed keys). 6) Network segmentation (VPCs, security groups). 7) Regular penetration testing. 8) Automated compliance checks in CI/CD (checkov, AWS Config). 9) Document everything for audit trails. 10) Regular access reviews and credential rotation." },
      { q: "What would you do in your first 30/60/90 days at TMX?", a: "First 30 days: Learn TMX's cloud architecture, meet team members, understand existing infrastructure and processes, review documentation, complete onboarding and security training, set up development environment, shadow on-call rotation. 60 days: Take ownership of specific infrastructure areas, contribute to Terraform modules, participate in on-call rotation, identify quick wins for improvement. 90 days: Lead small infrastructure projects, propose cost optimization or security improvements, contribute to cloud modernization roadmap, mentor newer team members on specific tools." },
    ],
  },
  {
    title: "SECTION 11: RESUME-BASED QUESTIONS (15 Questions)",
    questions: [
      { q: "Walk me through your resume.", a: "Use extended 90-second self-introduction from Document 01." },
      { q: "Tell me about your experience at TefoLogic.", a: "As a Cloud Engineer Intern (Apr-Jul 2024), I worked on AWS and GCP infrastructure. Key contributions: 1) Wrote Terraform configurations for VPC, EC2, RDS, and IAM resources. 2) Set up CI/CD pipelines with GitHub Actions for automated deployments. 3) Configured AWS IAM roles and policies following least privilege. 4) Managed Security Groups and monitored CloudTrail logs. 5) Collaborated with development teams on containerized deployments using Docker. It was a production environment serving real clients." },
      { q: "Why did you do two post-graduate programs?", a: "Strategic career planning. My first program (CyberSecurity Operations, Jan-Sept 2025) gave me deep security knowledge \u2014 SIEM, threat detection, incident response, compliance frameworks. My second program (CloudOps, Sept 2025-present) gives me cloud infrastructure expertise \u2014 AWS, Terraform, Kubernetes, CI/CD. Together, I'm uniquely positioned for security-focused cloud roles, which is exactly what TMX needs \u2014 someone who builds secure cloud infrastructure from the ground up." },
      { q: "Explain your SOC Threat Detection project in detail.", a: "Refer to Project Deep Dive Guide \u2014 Document 02, Project 1 section with full walkthrough." },
      { q: "Explain your SOAR-Lite project in detail.", a: "Refer to Project Deep Dive Guide \u2014 Document 02, Project 2 section with full walkthrough." },
      { q: "How is your SOAR-Lite different from your SOC Threat Detection project?", a: "SOC Threat Detection is a simple, single-run log analyzer \u2014 reads a log file, detects threats, outputs alerts to JSON. Think of it as a detection script. SOAR-Lite is a complete platform \u2014 it has persistent storage (SQLite with 4 tables), configurable rules (JSON config file), automated response (IP blocking), a web dashboard (Flask), and an end-to-end pipeline. SOAR-Lite is what you'd build if you wanted to evolve the SOC tool into a production-grade system." },
      { q: "What is CompTIA Security+ and why are you pursuing it?", a: "Security+ is an industry-standard cybersecurity certification covering threats, vulnerabilities, network security, identity management, cryptography, and risk management. I'm pursuing it because: 1) It validates my security knowledge formally. 2) It's recognized globally and often required for security-related roles. 3) It complements my cloud engineering skills \u2014 at TMX, security is paramount for financial infrastructure. I'm planning to take the exam next month." },
      { q: "What Terraform work did you do at TefoLogic specifically?", a: "I wrote Terraform HCL for: 1) VPC with public and private subnets across 2 AZs. 2) EC2 instances with proper security groups. 3) RDS PostgreSQL instance in a private subnet. 4) S3 buckets with encryption and versioning. 5) IAM roles and policies for service accounts. I used remote state (S3 + DynamoDB), modules for reusable components, and integrated terraform plan into our GitHub Actions CI pipeline for review before deployment." },
      { q: "How do you handle working in hybrid environments (office + remote)?", a: "I'm comfortable with hybrid work \u2014 it was the model at TefoLogic as well. For effective hybrid work: 1) Clear communication via Slack/Teams \u2014 over-communicate async context. 2) Use collaborative tools (Jira, Confluence, shared docs). 3) Be fully present during office days for collaborative sessions. 4) Maintain consistent productivity regardless of location. 5) Document decisions so remote team members are informed. TMX's 2-3 day office schedule works well for me." },
      { q: "What experience do you have with Docker?", a: "I've used Docker extensively in both projects and at TefoLogic. I've written Dockerfiles for my SOC Threat Detection project (multi-stage build with Python), created docker-compose configurations for multi-container setups, and pushed images to container registries. At TefoLogic, I containerized applications for consistent deployment across environments. Docker is the foundation for Kubernetes \u2014 understanding container networking, volumes, and images is essential before working with EKS/AKS." },
      { q: "What security frameworks are you familiar with?", a: "NIST Cybersecurity Framework (5 functions: Identify, Protect, Detect, Respond, Recover), ISO 27001 (information security management system with Annex A controls), MITRE ATT&CK (adversary tactics and techniques matrix), CIS Benchmarks (hardening guidelines for OS, cloud, containers). My SOAR-Lite project implements the Detect and Respond functions of NIST CSF. At TMX, I'd also need OSFI guidelines and PCI-DSS." },
      { q: "Tell me about your GCP experience.", a: "At TefoLogic, I worked with GCP alongside AWS \u2014 mainly Google Compute Engine, Cloud Storage, and IAM. While my primary experience is with AWS, understanding GCP has given me a multi-cloud perspective. The core concepts translate across providers: compute instances, object storage, IAM policies, networking. This adaptability is valuable at TMX where you work with both AWS and Azure." },
      { q: "How do your projects demonstrate cloud engineering skills?", a: "Both projects showcase skills directly relevant to cloud engineering: 1) Python automation \u2014 the same language used for cloud automation (boto3, Azure SDK). 2) Docker containerization \u2014 production-grade deployment. 3) Database management \u2014 SQLite in SOAR-Lite, translatable to RDS/Aurora. 4) Log processing \u2014 core to cloud monitoring and observability. 5) Security detection \u2014 essential for cloud security. 6) Modular architecture \u2014 clean separation of concerns, like microservices. 7) CI/CD mindset \u2014 version controlled, testable, deployable." },
      { q: "What is your experience with monitoring and logging tools?", a: "Academic and project experience with: Splunk (log aggregation, SPL queries, dashboards), ELK Stack (Elasticsearch for indexing, Logstash for ingestion, Kibana for visualization), AWS CloudTrail (API audit logs), CloudWatch (metrics and log groups). My SOC Threat Detection project is essentially a mini-SIEM \u2014 it ingests logs, applies detection rules, and generates alerts, which is the core monitoring pipeline." },
      { q: "Why are you interested in cloud engineering over pure cybersecurity?", a: "I love the intersection of both. Pure cybersecurity often means working reactively \u2014 responding to incidents. Cloud engineering lets me build secure systems proactively. With my security background, I design infrastructure that's secure by default \u2014 encrypted, segmented, monitored, compliant. At TMX, this combination is powerful: I can deploy cloud infrastructure AND understand the threat landscape it needs to be protected against. It's building AND defending." },
    ],
  },
  {
    title: "SECTION 12: DOCKER & CONTAINERIZATION (5 Questions)",
    questions: [
      { q: "What is Docker and why is it important for cloud?", a: "Docker packages applications with all dependencies into portable containers. Benefits: consistency across environments (\"works on my machine\" solved), lightweight (shares OS kernel, unlike VMs), fast startup, easy scaling. For cloud: containers are the deployment unit for Kubernetes. Docker images are immutable \u2014 same image in dev, staging, production. Essential for microservices architecture." },
      { q: "Explain Dockerfile best practices.", a: "1) Use specific base image tags (python:3.11-slim not python:latest). 2) Multi-stage builds to reduce image size. 3) Order instructions for cache optimization (COPY requirements.txt first, then pip install, then COPY app). 4) Run as non-root user (USER appuser). 5) Use .dockerignore to exclude unnecessary files. 6) Minimize layers by combining RUN commands. 7) Scan images for vulnerabilities (Trivy)." },
      { q: "What is the difference between Docker and Kubernetes?", a: "Docker builds and runs containers on a single host. Kubernetes orchestrates containers across multiple hosts. Docker = single container management. Kubernetes = fleet management. Docker alone doesn't provide: load balancing, auto-scaling, self-healing, rolling updates, service discovery, secret management. You need Kubernetes (or similar orchestrator) for production containerized workloads." },
      { q: "What is docker-compose and when do you use it?", a: "docker-compose defines multi-container applications in a single YAML file. Example: your app + PostgreSQL + Redis all defined together with networks and volumes. Great for local development and testing. Not for production \u2014 use Kubernetes instead. My SOAR-Lite project could use docker-compose to run the Flask dashboard, database, and detection engine together." },
      { q: "How do you optimize Docker image size?", a: "1) Use slim/alpine base images (python:3.11-alpine = 50MB vs python:3.11 = 900MB). 2) Multi-stage builds \u2014 build in full image, copy artifact to slim image. 3) Combine RUN commands to reduce layers. 4) Remove cache (pip install --no-cache-dir). 5) Use .dockerignore (exclude .git, tests, docs). 6) Don't install unnecessary packages. Target: smallest image that works, for faster pulls and smaller attack surface." },
    ],
  },
];

// Count total questions
let totalQ = 0;
sections.forEach(s => totalQ += s.questions.length);
console.log(`Total questions: ${totalQ}`);

// Build all body paragraphs
const children = [];

// Title
children.push(
  new Paragraph({
    spacing: { after: 100 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "INTERVIEW QUESTIONS BANK",
        font: FONT,
        size: 44,
        bold: true,
        color: NAVY,
      }),
    ],
  })
);

// Subtitle
children.push(
  new Paragraph({
    spacing: { after: 60 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "Cloud Engineer (R-5764) \u2014 TMX Group",
        font: FONT,
        size: 28,
        color: "444444",
      }),
    ],
  })
);

// Subtitle2
children.push(
  new Paragraph({
    spacing: { after: 200 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "145+ Predicted Questions with Model Answers",
        font: FONT,
        size: 24,
        color: "666666",
        italics: true,
      }),
    ],
  })
);

// Decorative line under title
children.push(
  new Paragraph({
    spacing: { after: 400 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY },
    },
    children: [],
  })
);

// Table of contents summary
children.push(
  new Paragraph({
    spacing: { before: 100, after: 60 },
    children: [
      new TextRun({
        text: "TABLE OF CONTENTS",
        font: FONT,
        size: 24,
        bold: true,
        color: NAVY,
      }),
    ],
  })
);

sections.forEach((sec, i) => {
  children.push(
    new Paragraph({
      spacing: { before: 40, after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({
          text: sec.title,
          font: FONT,
          size: 20,
          color: "444444",
        }),
      ],
    })
  );
});

children.push(
  new Paragraph({
    spacing: { after: 300 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 2, color: GRAY_LINE },
    },
    children: [],
  })
);

// Generate all sections and Q&A
let qCounter = 0;
sections.forEach((sec) => {
  children.push(sectionHeading(sec.title));

  sec.questions.forEach((item) => {
    qCounter++;
    const qaParagraphs = createQA(qCounter, item.q, item.a);
    qaParagraphs.forEach((p) => children.push(p));
  });
});

// End of document
children.push(
  new Paragraph({
    spacing: { before: 600 },
    alignment: AlignmentType.CENTER,
    border: {
      top: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
    },
    children: [
      new TextRun({
        text: "\u2014 End of Interview Questions Bank \u2014",
        font: FONT,
        size: 22,
        bold: true,
        color: NAVY,
        italics: true,
      }),
    ],
  })
);

children.push(
  new Paragraph({
    spacing: { before: 100 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: `${totalQ} Questions | 12 Sections | Prepared for TMX Group Cloud Engineer Interview`,
        font: FONT,
        size: 18,
        color: "888888",
      }),
    ],
  })
);

// Create Document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: FONT,
          size: 22,
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: {
            width: 12240,
            height: 15840,
          },
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "Interview Questions Bank \u2014 Cloud Engineer (R-5764) \u2014 TMX Group",
                  font: FONT,
                  size: 16,
                  color: "999999",
                  italics: true,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Page ",
                  font: FONT,
                  size: 16,
                  color: "999999",
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT,
                  size: 16,
                  color: "999999",
                }),
                new TextRun({
                  text: " of ",
                  font: FONT,
                  size: 16,
                  color: "999999",
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: FONT,
                  size: 16,
                  color: "999999",
                }),
              ],
            }),
          ],
        }),
      },
      children: children,
    },
  ],
});

// Generate and save
const outputPath = "C:\\Users\\jayar\\OneDrive\\Desktop\\Ravi kiran\\03_Interview_Questions_Bank.docx";

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document created successfully: ${outputPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}).catch((err) => {
  console.error("Error creating document:", err);
  process.exit(1);
});
