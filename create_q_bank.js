const docx = require("docx");
const fs = require("fs");

const {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  PageNumber, NumberFormat, AlignmentType, HeadingLevel,
  PageBreak, Tab, TabStopType, BorderStyle, ShadingType,
  TableOfContents, BookmarkStart, BookmarkEnd,
  convertInchesToTwip
} = docx;

const NAVY = "1B2A4A";
const DARK_GRAY = "333333";
const MEDIUM_GRAY = "555555";
const ACCENT_BLUE = "2E75B6";
const LIGHT_BG = "F2F6FA";
const WHITE = "FFFFFF";
const FONT = "Arial";
const FONT_SIZE_BODY = 22; // 11pt in half-points
const FONT_SIZE_Q = 23;
const FONT_SIZE_SECTION = 32;
const FONT_SIZE_SUBSECTION = 26;

function makeTitle(text, size, color, spacing, bold = true) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: spacing || 200 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size,
        color,
        bold,
      }),
    ],
  });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 400, after: 200 },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY },
    children: [
      new TextRun({
        text: "  " + text,
        font: FONT,
        size: FONT_SIZE_SECTION,
        color: WHITE,
        bold: true,
      }),
    ],
  });
}

function subsectionHeading(text) {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT_BLUE },
    },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: FONT_SIZE_SUBSECTION,
        color: ACCENT_BLUE,
        bold: true,
      }),
    ],
  });
}

function questionBlock(qNum, question, answer) {
  return [
    new Paragraph({
      spacing: { before: 280, after: 80 },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: LIGHT_BG },
      children: [
        new TextRun({
          text: `Q${qNum}: ${question}`,
          font: FONT,
          size: FONT_SIZE_Q,
          color: NAVY,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "A: ",
          font: FONT,
          size: FONT_SIZE_BODY,
          color: NAVY,
          bold: true,
        }),
        new TextRun({
          text: answer,
          font: FONT,
          size: FONT_SIZE_BODY,
          color: DARK_GRAY,
        }),
      ],
    }),
  ];
}

function pageBreakPara() {
  return new Paragraph({
    children: [new PageBreak()],
  });
}

// =============== ALL QUESTIONS DATA ===============

const sections = [
  {
    sectionTitle: "SECTION A: JD-BASED QUESTIONS (100% Probability of Being Asked)",
    subsections: [
      {
        title: "AWS Services (15 Questions)",
        questions: [
          [1, "What is IAM and how does it work?", "IAM is AWS Identity and Access Management. It controls who (authentication) can do what (authorization) in your AWS account. It has four main components: Users (individual identities), Groups (collections of users), Roles (temporary credentials for services or cross-account access), and Policies (JSON documents defining permissions with Effect, Action, and Resource). At TefoLogic, I implemented IAM following the principle of least privilege \u2014 each service had a role with only the permissions it needed. For example, our Lambda functions had roles that could only read from specific S3 buckets and write to specific DynamoDB tables."],
          [2, "Explain the principle of least privilege. How did you implement it?", "Least privilege means giving users and services only the minimum permissions they need to perform their tasks \u2014 nothing more. At TefoLogic, I implemented this by creating granular IAM policies for each service. Instead of using AdministratorAccess, I created custom policies. For example, our EC2 instances had a role that could only access CloudWatch for logging and specific S3 buckets for data. When someone needed temporary elevated access, we used IAM Roles with time-limited sessions rather than permanent credentials."],
          [3, "What is a VPC? Explain subnets, route tables, internet gateways.", "A VPC is a Virtual Private Cloud \u2014 your own isolated network in AWS. Think of it as your private data center in the cloud. Subnets divide the VPC into segments \u2014 public subnets have routes to the internet via an Internet Gateway, private subnets don't. Route tables define where network traffic goes \u2014 each subnet is associated with a route table. An Internet Gateway connects your VPC to the internet. For private subnets that need outbound internet access (like for updates), you use a NAT Gateway. At TefoLogic, we used a standard three-tier architecture: public subnets for load balancers, private subnets for application servers, and isolated subnets for databases."],
          [4, "Difference between Security Groups and NACLs?", "Security Groups are stateful firewalls at the instance level \u2014 if you allow inbound traffic, the response is automatically allowed. They only have allow rules. NACLs (Network Access Control Lists) are stateless firewalls at the subnet level \u2014 you must explicitly allow both inbound and outbound. NACLs have both allow and deny rules, and rules are evaluated in order by rule number. In practice, Security Groups are your primary defense, and NACLs add a second layer at the subnet boundary."],
          [5, "What is CloudTrail? How did you use it?", "CloudTrail logs every API call made in your AWS account \u2014 who did what, when, from which IP. It's essential for audit, compliance, and security forensics. In my AWS Cloud Security Monitoring project, I monitored CloudTrail logs to detect unauthorized access attempts and privilege escalation. For example, I looked for console logins from unusual IPs, IAM policy changes, and attempts to access resources outside normal permissions. CloudTrail logs are stored in S3 and can trigger CloudWatch alarms for real-time alerting."],
          [6, "Explain EC2 instance types. When would you use each?", "EC2 instance types are grouped by family. General Purpose (T3, M5) for balanced workloads like web servers. Compute Optimized (C5) for CPU-intensive tasks like batch processing. Memory Optimized (R5) for databases and caching. Storage Optimized (I3) for high I/O workloads. GPU instances (P3, G4) for machine learning. At TefoLogic, we mostly used T3 for general workloads and R5 for our database servers. The key is right-sizing \u2014 using CloudWatch to monitor CPU and memory, then choosing the smallest instance that meets performance requirements."],
          [7, "What is S3? Explain storage classes and lifecycle policies.", "S3 is Simple Storage Service \u2014 object storage with 99.999999999% durability. Storage classes from most to least expensive: S3 Standard (frequent access), S3 Intelligent-Tiering (auto-moves data), S3 Standard-IA (infrequent access, lower cost), S3 One Zone-IA (single AZ), S3 Glacier (archive, retrieval in minutes to hours), S3 Glacier Deep Archive (lowest cost, retrieval in 12 hours). Lifecycle policies automatically transition objects between classes based on age. For TMX, historical market data could start in Standard, move to IA after 30 days, and archive to Glacier after 90 days."],
          [8, "What is Lambda? When would you use serverless vs containers?", "Lambda is serverless compute \u2014 you upload code, and AWS runs it in response to events. No servers to manage, you pay only per invocation. Use Lambda for: event-driven tasks (S3 upload triggers processing), API backends (with API Gateway), scheduled tasks (CloudWatch Events cron), and short-running operations (under 15 minutes). Use containers (ECS/EKS) for: long-running services, complex applications with multiple dependencies, workloads needing persistent connections, or when you need more control over the runtime. At TefoLogic, we used Lambda for ETL triggers and CI/CD automation."],
          [9, "What is CloudWatch? Alarms, metrics, log groups?", "CloudWatch is AWS's monitoring and observability service. Metrics are data points about your resources (CPU utilization, network traffic, custom metrics). Alarms trigger actions when metrics cross thresholds \u2014 like sending SNS notifications or auto-scaling. Log Groups collect and store logs from services like EC2, Lambda, and ECS. You can create metric filters to extract patterns from logs and turn them into alarms. For example, you could filter CloudTrail logs for 'UnauthorizedAccess' events and trigger a PagerDuty alert."],
          [10, "Explain IaaS vs PaaS vs SaaS with AWS examples.", "IaaS (Infrastructure as a Service) gives you raw compute, storage, and networking \u2014 you manage everything above the infrastructure. AWS examples: EC2, VPC, S3, EBS. PaaS (Platform as a Service) manages the infrastructure for you \u2014 you just deploy your code. AWS examples: Elastic Beanstalk, RDS, Lambda, ECS. SaaS (Software as a Service) is fully managed applications. AWS examples: WorkMail, Chime, QuickSight. The TMX Cloud Engineer role involves all three, but primarily IaaS and PaaS for infrastructure deployment."],
          [11, "What is AWS Auto Scaling? How does it work?", "Auto Scaling automatically adjusts the number of EC2 instances based on demand. You define scaling policies \u2014 for example, add 2 instances when CPU exceeds 70%, remove 1 when it drops below 30%. It uses Launch Templates to define instance configuration and Target Tracking policies for automatic adjustment. It ensures high availability by maintaining minimum instances across Availability Zones. For TMX during market hours, you'd scale up to handle peak trading volume and scale down after hours to save costs."],
          [12, "What is an ALB vs NLB?", "Application Load Balancer (ALB) operates at Layer 7 (HTTP/HTTPS). It can route based on URL path, hostname, headers, and query strings. Supports WebSockets, HTTP/2, and integrates with WAF. Use for web applications. Network Load Balancer (NLB) operates at Layer 4 (TCP/UDP). It handles millions of requests per second with ultra-low latency. Supports static IPs and preserves source IP. Use for high-performance, non-HTTP workloads. For TMX, ALB would front web applications, while NLB would handle high-throughput trading data streams."],
          [13, "What is Route 53? How does DNS work?", "Route 53 is AWS's DNS service. DNS translates domain names to IP addresses. When you type a URL, your browser asks a DNS resolver, which queries root servers, TLD servers, then authoritative servers to find the IP. Route 53 supports routing policies: Simple (one record), Weighted (distribute traffic by percentage), Latency (route to lowest latency region), Failover (primary/secondary), and Geolocation (route by user location). For TMX, failover routing ensures automatic switchover to a DR region if the primary goes down."],
          [14, "What is CloudFormation? How does it compare to Terraform?", "CloudFormation is AWS's native IaC service \u2014 you define infrastructure in JSON/YAML templates, and AWS provisions it. Terraform by HashiCorp is multi-cloud IaC using HCL syntax. Key differences: CloudFormation is AWS-only but tightly integrated; Terraform supports AWS, Azure, GCP, and hundreds of providers. CloudFormation has better drift detection; Terraform has a larger community and more modules. At TefoLogic, we used Terraform because we worked with both AWS and GCP. For TMX with both AWS and Azure, Terraform would also be the better choice for consistency."],
          [15, "What is AWS EKS? How does it manage Kubernetes?", "EKS is Elastic Kubernetes Service \u2014 AWS's managed Kubernetes offering. AWS manages the control plane (API server, etcd, scheduler, controller manager) across multiple Availability Zones for high availability. You manage worker nodes \u2014 either EC2 instances (managed node groups) or Fargate profiles (serverless). EKS integrates with AWS services: ALB Ingress Controller for load balancing, IAM for pod-level authentication, CloudWatch Container Insights for monitoring, and ECR for container images."],
        ],
      },
      {
        title: "Azure Basics (10 Questions)",
        questions: [
          [16, "What is Azure Resource Manager?", "ARM is Azure's deployment and management layer. All Azure resources are created, updated, and deleted through ARM. It provides consistent management layer regardless of tool (Portal, CLI, PowerShell, SDK). ARM templates (JSON) or Bicep define infrastructure declaratively. Resource Groups organize related resources for lifecycle management. It's similar to CloudFormation for AWS, but ARM is the foundational management plane for all of Azure."],
          [17, "Azure VNet vs AWS VPC \u2014 similarities and differences?", "Both are isolated virtual networks in the cloud. Similar: Both support subnets, route tables, security rules, and peering. Both have public and private subnets. Differences: Azure uses NSGs (Network Security Groups) which can be applied to subnets OR individual NICs; AWS has Security Groups (instance-level, stateful) AND NACLs (subnet-level, stateless). Azure VNets can span an entire region by default; AWS VPCs are also regional but subnets are AZ-specific. Azure uses Azure Firewall; AWS uses Security Groups + NACLs + WAF."],
          [18, "What is Azure Active Directory (Entra ID)?", "Entra ID (formerly Azure AD) is Microsoft's cloud identity service. It provides authentication, SSO (Single Sign-On), MFA, and Conditional Access policies. Unlike AWS IAM which is account-scoped, Entra ID is a centralized identity provider that can manage access across Azure, Microsoft 365, and third-party SaaS apps. Conditional Access policies can require MFA based on location, device, or risk level. For TMX, Entra ID would manage employee access to both Azure and on-premises resources."],
          [19, "What is AKS?", "AKS is Azure Kubernetes Service \u2014 Azure's managed Kubernetes offering. Like EKS, Azure manages the control plane at no charge. AKS integrates with Entra ID for authentication, Azure Monitor for observability, Azure Container Registry for images, and Azure Policy for governance. It supports virtual nodes using Azure Container Instances for burst scaling. The choice between EKS and AKS typically depends on which cloud provider you're primarily using."],
          [20, "Azure Blob Storage vs AWS S3?", "Both are object storage services. Blob Storage has three types: Block Blobs (general files), Page Blobs (VHDs for VMs), and Append Blobs (logs). S3 only has objects. Blob Storage tiers: Hot, Cool, Archive. S3 tiers: Standard, IA, Glacier. Both support lifecycle policies, versioning, and replication. Blob Storage uses Containers (like S3 Buckets). Access control differs: Blob uses SAS tokens and RBAC; S3 uses bucket policies and ACLs."],
          [21, "What is Azure Monitor?", "Azure Monitor is the centralized monitoring service for all Azure resources. It collects metrics and logs, provides alerting, and integrates with Log Analytics for querying. Similar to CloudWatch in AWS. Key components: Metrics (performance data), Logs (Log Analytics workspace), Alerts (action groups), Application Insights (APM), and Workbooks (custom dashboards). For TMX, Azure Monitor would track infrastructure health alongside CloudWatch for AWS resources."],
          [22, "What are Azure NSGs?", "Network Security Groups are Azure's firewall rules. They contain inbound and outbound security rules with priority, source, destination, port, and protocol. Unlike AWS which separates Security Groups (instance-level) and NACLs (subnet-level), Azure NSGs can be applied to both subnets AND individual network interfaces. Rules are evaluated by priority number (lower = higher priority). NSGs are stateful, like AWS Security Groups."],
          [23, "Azure DevOps vs GitHub Actions?", "Both are CI/CD platforms. Azure DevOps is a complete suite: Boards (project management), Repos (Git), Pipelines (CI/CD), Test Plans, Artifacts. GitHub Actions is integrated into GitHub repositories with workflow YAML files. Azure DevOps is better for enterprise teams needing project management alongside CI/CD. GitHub Actions is simpler, more developer-friendly, and has a larger marketplace of community actions. Many organizations use both \u2014 GitHub for code, Azure DevOps for enterprise pipeline management."],
          [24, "What is Azure Key Vault?", "Key Vault securely stores and manages secrets (API keys, passwords), encryption keys, and SSL/TLS certificates. Applications reference secrets by URI instead of hardcoding them. It integrates with Entra ID for access control and provides audit logging. AWS equivalent is AWS Secrets Manager + KMS. For TMX, Key Vault would store database credentials, API keys, and TLS certificates used by cloud applications, ensuring secrets never appear in code or configuration files."],
          [25, "Multi-cloud strategy \u2014 when would you use AWS + Azure together?", "Multi-cloud makes sense for: avoiding vendor lock-in, leveraging each provider's strengths (AWS for compute/storage, Azure for Active Directory/Office integration), meeting regulatory requirements for geographic distribution, and disaster recovery across providers. Challenges include: complexity, skill requirements, and consistent security policies. Tools like Terraform, Kubernetes, and centralized identity (Entra ID + IAM) help manage multi-cloud. TMX likely uses both AWS and Azure, so understanding both ecosystems is essential."],
        ],
      },
      {
        title: "Terraform / IaC (10 Questions)",
        questions: [
          [26, "What is Infrastructure as Code? Why is it important?", "IaC means managing infrastructure through code files rather than manual configuration. Benefits: version control (track changes in Git), reproducibility (same code = same infrastructure every time), automation (CI/CD for infrastructure), documentation (code IS the documentation), and disaster recovery (rebuild entire environments from code). At TefoLogic, we used Terraform for all infrastructure \u2014 nothing was created manually in the console. This meant we could recreate our entire environment from scratch in minutes."],
          [27, "Explain terraform init, plan, apply, destroy.", "These are the four core Terraform commands. init downloads provider plugins and initializes the backend (where state is stored). plan shows what changes Terraform will make without actually making them \u2014 like a dry run. apply executes the changes shown in the plan. destroy tears down all resources defined in the configuration. The typical workflow is: write code, run plan to review, then apply. At TefoLogic, we always reviewed plan output in pull requests before applying changes."],
          [28, "What is Terraform state? Where should you store it?", "Terraform state is a JSON file that maps your configuration to real infrastructure. It tracks resource IDs, dependencies, and metadata. Never store state locally for team projects \u2014 use a remote backend. For AWS: S3 bucket for the state file + DynamoDB table for state locking (prevents concurrent modifications). For Azure: Azure Storage Account with blob container. State contains sensitive data, so encrypt it at rest and restrict access."],
          [29, "What are Terraform modules? Have you used them?", "Modules are reusable Terraform configurations \u2014 like functions in programming. They take input variables, create resources, and output values. You can use community modules from the Terraform Registry or write custom ones. At TefoLogic, we used modules for standard patterns \u2014 a VPC module that created subnets, route tables, and NAT gateways with consistent naming. This ensured every environment followed the same architecture."],
          [30, "How do you handle secrets in Terraform?", "Never hardcode secrets in Terraform files. Options: Use environment variables (TF_VAR_password), reference AWS Secrets Manager or Azure Key Vault using data sources, use terraform.tfvars files that are gitignored, or use tools like HashiCorp Vault. For sensitive outputs, mark them as sensitive = true to prevent display in logs. At TefoLogic, we stored database passwords in Secrets Manager and referenced them in Terraform using the aws_secretsmanager_secret data source."],
          [31, "What is terraform import?", "terraform import brings existing infrastructure under Terraform management. If resources were created manually in the console, you can import them into your state file. You write the resource block in your config, then run terraform import resource_type.name resource_id. After importing, you run plan to verify the configuration matches the actual resource. This is useful when migrating from manual infrastructure to IaC."],
          [32, "Explain Terraform providers and resources.", "Providers are plugins that interact with cloud platforms \u2014 AWS, Azure, GCP, Kubernetes, etc. Each provider offers resources and data sources. Resources are the infrastructure you create (aws_instance, azurerm_virtual_network). Data sources read existing infrastructure without managing it (data.aws_ami, data.azurerm_subscription). You declare providers in your config with credentials and region. Terraform downloads providers during init."],
          [33, "How do you handle Terraform state locking?", "State locking prevents concurrent modifications. When someone runs terraform apply, the state file is locked so no one else can modify it simultaneously. For AWS: use a DynamoDB table with LockID as the partition key. Configure it in the backend block alongside the S3 bucket. For Azure: Azure Storage provides locking automatically through blob leases. Without locking, two engineers running apply simultaneously could corrupt the state file."],
          [34, "Terraform vs CloudFormation?", "Terraform: multi-cloud, HCL syntax (human-readable), large community, extensive provider ecosystem, plan command for preview. CloudFormation: AWS-only, JSON/YAML, tight AWS integration, better drift detection, no state management needed (AWS manages it), supports nested stacks. I prefer Terraform because it works across clouds and has more readable syntax. For TMX using both AWS and Azure, Terraform provides a consistent workflow across both providers."],
          [35, "How did you use Terraform at TefoLogic?", "At TefoLogic, I used Terraform to automate infrastructure deployment across AWS and GCP. I wrote HCL configurations for EC2 instances, VPCs, security groups, S3 buckets, and Lambda functions. We stored state remotely in S3 with DynamoDB locking. I used modules for repeatable patterns like VPC creation. Our CI/CD pipeline ran terraform plan on pull requests for review, and terraform apply on merge to main. I also documented our infrastructure by maintaining clear, commented Terraform files."],
        ],
      },
      {
        title: "Kubernetes / EKS / AKS (10 Questions)",
        questions: [
          [36, "What is Kubernetes? Why is it needed?", "Kubernetes is an open-source container orchestration platform. It automates deployment, scaling, and management of containerized applications. You need it when: you have multiple containers that need to communicate, you need automatic scaling and self-healing, you want zero-downtime deployments, or you need to manage workloads across multiple nodes. Without Kubernetes, you'd manually manage container placement, scaling, and recovery. I've worked with Docker for containerization, and Kubernetes extends that to manage containers at scale across clusters."],
          [37, "Explain Pod, Node, Cluster, Namespace.", "Pod is the smallest deployable unit \u2014 one or more containers sharing network and storage. Node is a machine (VM or physical) that runs pods \u2014 it has kubelet (agent), container runtime, and kube-proxy. Cluster is the complete system \u2014 a control plane (API server, scheduler, etcd) managing multiple worker nodes. Namespace provides logical isolation within a cluster \u2014 like virtual clusters. Common namespaces: default, kube-system, and custom ones like dev, staging, production."],
          [38, "What is a Deployment vs StatefulSet?", "Deployments manage stateless applications \u2014 pods are interchangeable, can be replaced without data loss. They support rolling updates and rollbacks. StatefulSets manage stateful applications \u2014 each pod has a persistent identity, stable network name, and ordered deployment. Use Deployments for web servers, APIs, microservices. Use StatefulSets for databases (MongoDB, PostgreSQL), message queues (Kafka), and applications that need stable persistent storage."],
          [39, "What is a Kubernetes Service? Types?", "A Service provides a stable network endpoint for a set of pods. Since pods are ephemeral (they can be created and destroyed), Services give a permanent address. Three main types: ClusterIP (internal-only access within the cluster \u2014 default), NodePort (exposes on each node's IP at a static port \u2014 for development), LoadBalancer (creates a cloud load balancer \u2014 for production). There's also ExternalName for DNS-based routing. Services use label selectors to find their target pods."],
          [40, "What is kubectl? Common commands?", "kubectl is the command-line tool for Kubernetes. Essential commands: kubectl get pods (list pods), kubectl get deployments (list deployments), kubectl get services (list services), kubectl apply -f file.yaml (create/update resources from YAML), kubectl describe pod name (detailed info), kubectl logs pod-name (view logs), kubectl exec -it pod -- /bin/bash (shell into pod), kubectl scale deployment name --replicas=5 (scale), kubectl delete pod name (delete)."],
          [41, "What is a Helm chart?", "Helm is the package manager for Kubernetes \u2014 like apt for Ubuntu or npm for Node.js. A Helm Chart is a package of pre-configured Kubernetes resources. Instead of writing 10+ YAML files for a complex application, you install a Helm chart with one command. Charts support templating (values.yaml for customization) and versioning. Popular charts exist for nginx, PostgreSQL, Prometheus, Grafana. For TMX, Helm would standardize deployments across environments."],
          [42, "What is EKS? How does AWS manage the control plane?", "EKS is Elastic Kubernetes Service. AWS manages the control plane \u2014 etcd (cluster state database), API server (processes requests), scheduler (assigns pods to nodes), and controller manager (maintains desired state). The control plane runs across three Availability Zones for high availability. You manage worker nodes using EC2 Managed Node Groups (AWS handles node scaling and updates) or Fargate (serverless \u2014 no nodes to manage). EKS integrates with IAM, ALB, CloudWatch, and ECR."],
          [43, "How do you scale applications in Kubernetes?", "Three levels of scaling. Horizontal Pod Autoscaler (HPA) adds/removes pod replicas based on CPU/memory or custom metrics. Vertical Pod Autoscaler (VPA) adjusts CPU/memory requests for individual pods. Cluster Autoscaler adds/removes nodes based on pending pods that can't be scheduled. For EKS, you can also use Karpenter (AWS's next-gen autoscaler) for faster, more efficient node provisioning. For TMX, HPA would scale trading services during market hours."],
          [44, "What is an Ingress controller?", "Ingress manages external HTTP/HTTPS access to services. An Ingress Controller (like nginx-ingress or AWS ALB Ingress Controller) implements the Ingress rules. Ingress can route traffic based on hostname (api.tmx.com vs web.tmx.com) or URL path (/api/* vs /web/*). It can also handle TLS termination. Without Ingress, you'd need a LoadBalancer Service for each application. With Ingress, one load balancer routes to multiple services."],
          [45, "How do you monitor Kubernetes workloads?", "Multiple layers of monitoring. Cluster level: Prometheus for metrics collection, Grafana for dashboards. For EKS: CloudWatch Container Insights provides CPU, memory, network, and disk metrics per pod, node, and cluster. Application level: custom metrics exposed via /metrics endpoint. Logging: Fluentd or Fluent Bit to ship container logs to CloudWatch Logs or ELK Stack. Alerts: Prometheus AlertManager or CloudWatch Alarms for threshold-based alerts."],
        ],
      },
      {
        title: "Networking & Security (10 Questions)",
        questions: [
          [46, "Explain TCP/IP model layers.", "The TCP/IP model has four layers. Application Layer (HTTP, DNS, SSH, FTP) \u2014 where user applications communicate. Transport Layer (TCP, UDP) \u2014 ensures reliable delivery (TCP with 3-way handshake) or fast delivery (UDP). Internet Layer (IP, ICMP) \u2014 handles routing and addressing using IP addresses. Network Access Layer (Ethernet, WiFi) \u2014 physical transmission of data. Data flows down through layers when sending, up through layers when receiving. Each layer adds its own header."],
          [47, "What is a VPN? Types?", "VPN creates an encrypted tunnel between two endpoints. Site-to-Site VPN connects entire networks \u2014 like connecting TMX's on-premises data center to AWS VPC. Client VPN allows individual users to securely connect to the network remotely \u2014 like engineers accessing production systems from home. In AWS, Site-to-Site VPN uses Virtual Private Gateway on the VPC side and Customer Gateway on-premises. AWS Client VPN provides managed OpenVPN-based access. VPNs encrypt all traffic in transit."],
          [48, "What is a firewall? How do cloud firewalls differ?", "A firewall controls network traffic based on rules. Traditional firewalls are physical or virtual appliances. Cloud firewalls are software-defined and API-manageable. AWS Security Groups operate at instance level (stateful), NACLs at subnet level (stateless). Azure NSGs work at both subnet and NIC level. Advantages of cloud firewalls: programmable via IaC, scalable automatically, integrated with cloud services, and logged via CloudTrail/Azure Monitor. At TefoLogic, I managed EC2 Security Groups via Terraform."],
          [49, "Explain CIDR notation.", "CIDR (Classless Inter-Domain Routing) defines IP address ranges. Format: IP/prefix-length. The prefix-length indicates how many bits are fixed. For example: 10.0.0.0/16 = 65,536 IPs (first 16 bits fixed), 10.0.1.0/24 = 256 IPs (first 24 bits fixed), 10.0.1.0/28 = 16 IPs. The smaller the prefix number, the more IPs. For VPC design: /16 for the VPC, /24 for subnets. A /32 is a single IP address, commonly used in security group rules."],
          [50, "What is VPC peering? Transit Gateway?", "VPC Peering creates a private network connection between two VPCs \u2014 traffic stays on AWS's network, not the internet. It's one-to-one and non-transitive (if A peers with B and C, B and C can't communicate through A). Transit Gateway solves this \u2014 it's a hub that connects multiple VPCs, VPNs, and Direct Connect. All VPCs connect to the Transit Gateway and can communicate through it. For TMX with many accounts and VPCs, Transit Gateway is the better architecture."],
          [51, "What is DNS? How does resolution work?", "DNS translates domain names to IP addresses. Resolution flow: Browser checks its cache, then OS cache, then sends query to recursive resolver (ISP's DNS server). If not cached, resolver queries root servers (know where .com lives), then TLD servers (.com knows where tmx.com lives), then authoritative servers (tmx.com knows the IP). Result is cached for the TTL (Time To Live) duration. AWS Route 53 is both authoritative DNS (hosts your records) and can function as a resolver."],
          [52, "What is TLS/SSL? How does HTTPS work?", "TLS (Transport Layer Security, successor to SSL) encrypts communication between client and server. HTTPS = HTTP + TLS. The TLS handshake: Client sends hello with supported cipher suites, server responds with its certificate, client verifies certificate with Certificate Authority, they agree on a symmetric encryption key using asymmetric key exchange, then all data is encrypted with that key. AWS Certificate Manager provides free TLS certificates for ALB and CloudFront. For TMX, all traffic must be encrypted in transit."],
          [53, "What is a bastion host / jump box?", "A bastion host is a hardened server in a public subnet that provides SSH/RDP access to instances in private subnets. Instead of giving every private instance a public IP, you SSH to the bastion, then SSH from there to private instances. Modern alternative: AWS Systems Manager Session Manager \u2014 no bastion needed, no SSH keys, all access logged in CloudTrail. For TMX, Session Manager is preferred because it eliminates the need to manage bastion servers and provides better audit trails."],
          [54, "Explain public and private subnets.", "A public subnet has a route to an Internet Gateway \u2014 instances with public IPs can be accessed from the internet. A private subnet has no direct internet route \u2014 instances are only accessible internally. Private subnets use a NAT Gateway (in a public subnet) for outbound internet access (like downloading updates). Best practice: Put load balancers and bastions in public subnets. Put application servers, databases, and sensitive services in private subnets. This is how we structured VPCs at TefoLogic."],
          [55, "What is a WAF?", "A Web Application Firewall protects web applications from common attacks. AWS WAF integrates with ALB, CloudFront, and API Gateway. It uses rules to filter: SQL injection, cross-site scripting (XSS), rate limiting (DDoS protection), geo-blocking, and IP reputation. You can use AWS Managed Rules for common protections or write custom rules. For TMX, WAF would protect public-facing web applications and APIs from OWASP Top 10 vulnerabilities."],
        ],
      },
      {
        title: "CI/CD Pipelines (10 Questions)",
        questions: [
          [56, "What is CI/CD? Explain the pipeline stages.", "CI (Continuous Integration) automatically builds and tests code on every commit. CD (Continuous Delivery) automatically deploys to staging; Continuous Deployment goes straight to production. Pipeline stages: Source (code commit triggers pipeline), Build (compile code, install dependencies), Test (unit tests, integration tests, security scans), Deploy to staging (automatic), Manual approval (for production), Deploy to production. At TefoLogic, our pipeline ran on every pull request: lint, test, terraform plan. On merge to main: terraform apply."],
          [57, "What tools have you used for CI/CD?", "At TefoLogic, we used CI/CD pipelines for infrastructure automation. I've worked with GitHub Actions for workflow automation \u2014 YAML-based, integrated with GitHub repositories. For Terraform, our pipeline ran plan on PRs and apply on merge. I also have experience with the concepts of Jenkins (self-hosted, plugin-based), GitLab CI (built into GitLab), and AWS CodePipeline (native AWS). For TMX, I'd adapt to whatever CI/CD tooling the team uses."],
          [58, "What is a build artifact?", "A build artifact is the output of the build process \u2014 the deployable package. Examples: compiled binaries, Docker images, JAR files, ZIP packages, Terraform plan files. Artifacts are stored in registries: Docker images in ECR or Docker Hub, packages in Artifactory or CodeArtifact, Terraform plans in S3. Artifacts should be immutable \u2014 the same artifact tested in staging should be deployed to production, ensuring consistency."],
          [59, "What is blue-green deployment vs canary deployment?", "Blue-green deployment runs two identical environments. Blue is current production, Green is the new version. You switch traffic from Blue to Green. If something fails, switch back instantly. Pros: instant rollback. Cons: double the infrastructure cost. Canary deployment gradually shifts traffic \u2014 start with 5% to the new version, monitor metrics, gradually increase to 100%. Pros: limits blast radius. Cons: slower rollout. For TMX, canary deployments would be safer for financial systems \u2014 test with small traffic before full rollout."],
          [60, "How do you handle rollbacks in CI/CD?", "Multiple strategies: For Kubernetes, kubectl rollout undo reverts to the previous deployment. For Terraform, apply the previous Git commit. For blue-green, switch traffic back to the old environment. For containers, deploy the previous image tag from the registry. The key is: every deployment must be reversible. At TefoLogic, we tagged every deployment and kept the previous version's infrastructure running for 30 minutes after cutover."],
          [61, "What is GitOps?", "GitOps uses Git as the single source of truth for both application and infrastructure. All changes go through pull requests. Tools like ArgoCD or Flux continuously sync the cluster state with the Git repository. Benefits: auditable (every change is a Git commit), reviewable (pull request reviews), reversible (git revert to rollback). For infrastructure, Terraform + GitOps means all infrastructure changes are tracked in Git history."],
          [62, "How do you secure a CI/CD pipeline?", "Security best practices: Store secrets in vault (not in code), use OIDC for cloud authentication (no long-lived credentials), scan dependencies for vulnerabilities (Dependabot, Snyk), run SAST/DAST security scans, sign artifacts, use least-privilege IAM roles for pipeline, enable audit logging, require approvals for production deployments, and scan container images (ECR scanning, Trivy). Never allow the pipeline to bypass security checks."],
          [63, "What is a container registry?", "A container registry stores Docker images. AWS ECR (Elastic Container Registry) is private, integrates with ECS/EKS, and supports image scanning. Azure Container Registry (ACR) is Azure's equivalent. Docker Hub is public. Key features: image tagging (latest, v1.2.3, git-sha), vulnerability scanning, lifecycle policies to clean old images, and cross-region replication. For CI/CD, the pipeline builds an image, pushes to ECR, then deploys to EKS using that image."],
          [64, "How did you automate workflows at TefoLogic using CI/CD?", "At TefoLogic, I automated infrastructure and ETL workflows. Our CI/CD pipeline had these stages: On PR: lint Terraform code, run terraform plan, post the plan output as a PR comment for review. On merge to main: terraform apply to deploy infrastructure changes. For ETL: code changes triggered Lambda deployment through S3 upload and function update. We also automated documentation \u2014 changes to infrastructure generated updated architecture diagrams."],
          [65, "What is Infrastructure as Code testing?", "IaC testing ensures your infrastructure code works before deployment. Levels: Static analysis (terraform validate, tflint for syntax and best practices), Unit testing (Terratest in Go, pytest with moto for mocking AWS), Plan review (terraform plan output review), Integration testing (deploy to ephemeral environment, validate, destroy), Compliance testing (OPA/Sentinel for policy enforcement \u2014 like 'all S3 buckets must be encrypted'). At TefoLogic, we ran validate and plan in CI, with full integration tests weekly."],
        ],
      },
      {
        title: "Incident Response & Monitoring (10 Questions)",
        questions: [
          [66, "What is incident response? Explain the phases.", "Incident response is the systematic approach to managing security incidents. NIST phases: 1. Preparation (tools, runbooks, training), 2. Detection & Analysis (identify and assess the incident), 3. Containment (stop the spread \u2014 my SOAR-Lite auto-blocks IPs), 4. Eradication (remove the threat), 5. Recovery (restore normal operations), 6. Lessons Learned (post-incident review, update procedures). For TMX, incidents during market hours require the fastest possible response to minimize trading disruption."],
          [67, "What is a SIEM? Name some tools.", "SIEM (Security Information & Event Management) collects logs from multiple sources, correlates events across systems, and generates alerts for security threats. Tools: Splunk (enterprise leader, SPL query language), ELK Stack (open-source: Elasticsearch + Logstash + Kibana), IBM QRadar, Microsoft Sentinel, AWS Security Hub. My SOC projects implement core SIEM functionality \u2014 log collection, rule-based detection, and alerting. I have hands-on experience with ELK Stack."],
          [68, "What is root cause analysis? Give an example.", "RCA determines the underlying cause of an incident, not just the symptoms. The '5 Whys' technique: Why did the service go down? \u2192 EC2 instance ran out of disk. Why? \u2192 Log files filled the disk. Why? \u2192 Log rotation wasn't configured. Why? \u2192 It wasn't in the base AMI. Why? \u2192 No standard AMI hardening checklist. Root cause: Missing AMI hardening process. Fix: Create hardened AMI with log rotation, add disk monitoring alarm. At TefoLogic, I participated in post-incident reviews using this approach."],
          [69, "What is SLA/SLO/SLI?", "SLA (Service Level Agreement) is a contract with customers promising a certain uptime \u2014 like 99.99% availability. SLO (Service Level Objective) is the internal target \u2014 you aim higher than the SLA. If SLA is 99.99%, SLO might be 99.995%. SLI (Service Level Indicator) is the actual measurement \u2014 real uptime percentage, response time, error rate. For TMX, SLAs would be extremely strict during market hours \u2014 99.999% availability for trading systems."],
          [70, "How do you handle an on-call incident at 2 AM?", "Step 1: Acknowledge the alert in PagerDuty within 5 minutes. Step 2: Assess severity \u2014 check dashboards, logs, and impact. Step 3: If SEV1, start the incident bridge and notify the team. Step 4: Follow the runbook for the specific alert type. Step 5: Contain the issue (failover to secondary, scale up, restart service). Step 6: Communicate status updates to stakeholders. Step 7: Once resolved, document the timeline and root cause. Step 8: Schedule RCA meeting for next business day. I'm comfortable with on-call rotations."],
          [71, "What is a runbook?", "A runbook is a documented set of step-by-step instructions for handling specific incidents or operational tasks. Example: 'High CPU on production server: 1. Check CloudWatch dashboard, 2. Identify the process (top/htop), 3. If it's the application, check for connection pool exhaustion, 4. If confirmed, restart the service, 5. If recurring, escalate to engineering.' Runbooks reduce MTTR because even junior engineers can handle common issues. At TMX, runbooks would cover scenarios like trading system alerts, database failovers, and network issues."],
          [72, "Explain monitoring vs alerting vs logging.", "Monitoring continuously collects metrics about system health \u2014 CPU, memory, network, response times. Alerting triggers notifications when metrics exceed thresholds \u2014 CloudWatch Alarm, PagerDuty page. Logging records detailed events for debugging and forensics \u2014 application logs, access logs, audit logs. They work together: monitoring detects the problem, alerting notifies the team, logging provides the details needed to diagnose and fix. My SOAR-Lite project implements all three."],
          [73, "What is an Indicator of Compromise (IoC)?", "IoC is a forensic artifact that indicates a potential security breach. Types: IP addresses (known malicious), file hashes (malware signatures), domain names (C2 servers), unusual network traffic patterns, unexpected privileged user activity, login anomalies. In my SOAR-Lite project, I track IoCs like malicious IP addresses in a watchlist and unusual login times as behavioral IoCs. Real-world SIEM tools maintain IoC databases that are continuously updated with threat intelligence feeds."],
          [74, "How would you set up monitoring for a cloud application?", "Layered approach: Infrastructure monitoring with CloudWatch (EC2, RDS, ALB metrics). Application monitoring with CloudWatch custom metrics or APM tools (Datadog, New Relic). Log aggregation with CloudWatch Logs or ELK Stack. Alerting with CloudWatch Alarms \u2192 SNS \u2192 PagerDuty. Dashboards with CloudWatch or Grafana. Specific metrics I'd track: CPU/memory utilization, request latency (p50, p95, p99), error rates, disk usage, and application-specific metrics. For TMX, I'd add trading-specific metrics like order processing time."],
          [75, "What is disaster recovery? RPO vs RTO?", "DR ensures business continuity after a disaster. RPO (Recovery Point Objective) = maximum acceptable data loss measured in time. RPO of 1 hour means you can lose up to 1 hour of data. RTO (Recovery Time Objective) = maximum acceptable downtime. RTO of 15 minutes means systems must be restored within 15 minutes. DR strategies from cheapest/slowest to most expensive/fastest: Backup & Restore, Pilot Light, Warm Standby, Multi-Site Active-Active. For TMX during market hours, RTO must be near-zero, requiring active-active with automated failover."],
        ],
      },
    ],
  },
  {
    sectionTitle: "SECTION B: RESUME-BASED QUESTIONS",
    subsections: [
      {
        title: "About TefoLogic Internship (10 Questions)",
        questions: [
          [76, "Walk me through your day-to-day at TefoLogic.", "My typical day started with checking monitoring dashboards for any overnight incidents in our AWS and GCP environments. I'd review and resolve any alerts \u2014 things like high CPU, failed deployments, or security notifications. Mid-morning, I'd work on infrastructure tasks: writing Terraform code for new resources, updating CI/CD pipelines, or automating ETL workflows with Lambda and S3. Afternoons were usually spent on documentation, change management, and collaborating with developers on infrastructure requirements. I also participated in weekly team standups and sprint planning."],
          [77, "What AWS services did you work with?", "Primarily: EC2 for compute, S3 for storage and ETL data, Lambda for serverless functions and automation, IAM for access management, VPC for networking, CloudTrail for audit logging, CloudWatch for monitoring, and Security Groups for firewall rules. I also worked with the CI/CD toolchain to deploy infrastructure changes. My responsibilities included monitoring these services for incidents and automating routine tasks using Terraform."],
          [78, "What GCP services did you use?", "I worked with GCP alongside AWS for incident monitoring and resolution. Specifically, I used Compute Engine for VMs, Cloud Storage, IAM for access control, and Cloud Monitoring for observability. The multi-cloud experience taught me that while the services have different names, the underlying concepts are the same \u2014 compute, storage, networking, identity, and monitoring."],
          [79, "Describe a specific Terraform project you worked on.", "One project was automating our VPC setup across multiple environments. I wrote a Terraform module that created a VPC with public and private subnets, NAT gateways, route tables, and security groups. The module accepted variables for CIDR ranges, environment name, and tags. By using this module, we could spin up a new environment \u2014 dev, staging, or production \u2014 with a single terraform apply command. This reduced environment setup time from hours of manual work to about 10 minutes."],
          [80, "What did your CI/CD pipeline look like?", "Our pipeline had four stages: 1. Lint \u2014 validate Terraform syntax and check for best practices using tflint. 2. Plan \u2014 run terraform plan and post the output as a PR comment for review. 3. Manual approval \u2014 a senior engineer reviewed the plan before apply. 4. Apply \u2014 on merge to main, terraform apply executed the changes. For application deployments, we had similar stages: build, test, push Docker image to registry, deploy to staging, smoke test, then deploy to production."],
          [81, "What kind of incidents did you monitor and resolve?", "I handled several types: Infrastructure incidents like EC2 instances reaching CPU/memory limits, which I resolved by right-sizing or scaling. Network issues like security group misconfigurations blocking legitimate traffic. Deployment failures where Terraform apply failed due to resource conflicts \u2014 I'd debug state issues and rerun. I also monitored CloudTrail for security events like unexpected API calls or IAM policy changes. My approach was always: contain first, fix, then document."],
          [82, "Tell me about the ETL workflows you automated.", "I automated ETL pipelines using AWS services. Data landed in S3 buckets, which triggered Lambda functions for transformation. The Lambda functions processed the data \u2014 cleaning, normalizing, and formatting \u2014 then loaded results into the target storage. I used Terraform to define the S3 bucket, Lambda function, IAM roles, and event triggers as infrastructure. The CI/CD pipeline deployed Lambda code changes automatically on merge, ensuring continuous delivery of ETL improvements."],
          [83, "What documentation did you create?", "I documented three types of content: Operational procedures \u2014 step-by-step guides for common tasks like deploying infrastructure changes and handling incidents. Architecture documentation \u2014 diagrams and descriptions of our cloud infrastructure, networking, and data flows. Change management records \u2014 documenting what changed, why, when, and the rollback plan for each infrastructure modification. This documentation was essential for audit and compliance requirements."],
          [84, "What was the most challenging incident you handled?", "We had an incident where an ETL pipeline was silently failing \u2014 data was being dropped without errors. I investigated CloudWatch logs, traced the issue to a Lambda function timeout on large files. The function was processing synchronously and hitting the 15-minute limit. I resolved it by breaking the processing into smaller chunks using S3 event notifications with prefix filters, so each Lambda invocation handled a manageable subset. I also added CloudWatch alarms for Lambda errors and duration to catch similar issues earlier."],
          [85, "What did you learn at TefoLogic that you'd bring to TMX?", "Three key lessons: First, infrastructure should always be codified \u2014 manual changes create drift and risk. Everything I'd do at TMX would be in Terraform. Second, monitoring and alerting must be proactive, not reactive \u2014 set thresholds before incidents happen. Third, documentation is as important as the code itself \u2014 especially in a regulated industry like financial services. I also learned the value of change management processes, which are critical for TMX's mission-critical systems."],
        ],
      },
      {
        title: "About Education (5 Questions)",
        questions: [
          [86, "Why two post-grad certificates?", "Strategic decision. Cybersecurity Operations gave me the security foundation \u2014 SOC monitoring, threat detection, incident response, SIEM, compliance frameworks. CloudOps builds the cloud engineering skills \u2014 AWS, Azure, Terraform, Kubernetes, CI/CD. Together, they make me uniquely qualified for roles that require both, like this Cloud Engineer position at TMX where security is paramount for financial infrastructure. Most candidates have one or the other \u2014 I have both."],
          [87, "What are you learning in CloudOps right now?", "We're covering advanced cloud architecture \u2014 multi-region deployments, high availability patterns, disaster recovery strategies. Also Kubernetes orchestration with EKS and AKS, advanced Terraform with modules and workspaces, CI/CD pipeline design, and cloud cost optimization. The program is very hands-on \u2014 we build real infrastructure in AWS and Azure lab environments."],
          [88, "How does cybersecurity background help in cloud engineering?", "Security is integral to cloud engineering, not separate from it. My cybersecurity training means I think about IAM policies, network segmentation, encryption, and compliance from day one \u2014 not as an afterthought. I understand threat models, which helps me design more secure infrastructure. I can read CloudTrail logs and understand what constitutes suspicious activity. For TMX in the financial sector, this security-first mindset is essential."],
          [89, "When will you complete Security+? Why that certification?", "I'm targeting completion within the next month. I chose Security+ because it validates foundational cybersecurity knowledge \u2014 risk management, threats, cryptography, identity management \u2014 which complements my cloud skills. It's also recognized industry-wide and is a baseline for many security-related roles. After Security+, my next target is AWS Solutions Architect Associate to formalize my cloud expertise."],
          [90, "Do you plan to get AWS Solutions Architect certification?", "Absolutely. AWS SAA is my next certification after Security+. I already have hands-on AWS experience from TefoLogic and my projects, so I'm building on a strong foundation. The certification will validate my ability to design distributed systems, choose appropriate AWS services, and implement cost-effective architectures \u2014 all directly relevant to the Cloud Engineer role at TMX."],
        ],
      },
      {
        title: "About Technical Skills (5 Questions)",
        questions: [
          [91, "Explain how Splunk and ELK Stack work.", "Splunk: Commercial SIEM. It ingests data from various sources using forwarders, indexes it for fast search, and provides SPL (Search Processing Language) for querying. Dashboards visualize results. Example query: index=main sourcetype=syslog 'Failed password' | stats count by src_ip. ELK Stack: Open-source. Elasticsearch stores and indexes data (search engine), Logstash collects and transforms logs (pipeline), Kibana visualizes data (dashboards). I built my SOC monitoring lab using ELK Stack to analyze Windows and Linux endpoint logs."],
          [92, "What is EDR? Have you used any tools?", "EDR \u2014 Endpoint Detection and Response \u2014 monitors endpoints for suspicious activity using behavioral analysis, not just signature matching. It can detect fileless malware, lateral movement, and zero-day exploits. Leading tools: CrowdStrike Falcon, Microsoft Defender for Endpoint, Carbon Black, SentinelOne. While I haven't deployed production EDR, my academic work covered EDR concepts, and my SOC projects apply similar behavioral detection principles \u2014 detecting abnormal patterns rather than matching known signatures."],
          [93, "Explain NIST Cybersecurity Framework.", "NIST CSF has five core functions: Identify (asset inventory, risk assessment), Protect (access control, encryption, training), Detect (monitoring, anomaly detection), Respond (incident response, communication), Recover (recovery planning, improvements). Implementation Tiers range from 1 (Partial \u2014 ad hoc) to 4 (Adaptive \u2014 continuously improving). My projects implement Detect (detection engine), Respond (auto-block), and Recover (incident reports). For TMX, NIST provides a framework to organize their security program."],
          [94, "What is ISO 27001?", "ISO 27001 is the international standard for Information Security Management Systems (ISMS). It requires organizations to systematically manage information security risks. Key components: Risk assessment and treatment, 114 controls across 14 domains (access control, cryptography, physical security, etc.), Plan-Do-Check-Act cycle for continuous improvement, and regular audits. ISO 27017 extends it for cloud security, ISO 27018 for PII in cloud. For TMX, ISO 27001 compliance would be expected given the financial regulatory environment."],
          [95, "You mention Wireshark \u2014 what have you used it for?", "I've used Wireshark in Hack The Box CTF challenges for network traffic analysis. Specifically: capturing and analyzing packet captures (.pcap files), following TCP streams to reconstruct conversations, filtering traffic by protocol (HTTP, DNS, TCP), identifying suspicious patterns like port scanning or data exfiltration, and extracting credentials from unencrypted traffic. For cloud engineering, Wireshark skills help debug networking issues \u2014 like verifying security group rules are correctly allowing/blocking traffic."],
        ],
      },
    ],
  },
  {
    sectionTitle: "SECTION C: PROJECT-BASED QUESTIONS",
    subsections: [
      {
        title: "Project Deep Dive (Q96\u2013Q125)",
        questions: [],
        note: "See 02_Project_Deep_Dive_Guide.docx for 30 detailed project questions with model answers (Q96\u2013Q125). These questions cover your SOAR-Lite Automation Platform, AWS Cloud Security Monitoring System, SOC Monitoring Lab, and Flask Inventory Management System projects in depth, including architecture decisions, technical challenges, and lessons learned.",
      },
    ],
  },
  {
    sectionTitle: "SECTION D: BEHAVIORAL QUESTIONS (15 Questions with STAR Answers)",
    subsections: [
      {
        title: "Behavioral / Situational (15 Questions)",
        questions: [
          [126, "Tell me about a time you solved a complex technical problem.", "Situation: At TefoLogic, our ETL pipeline was silently dropping data. Task: I needed to identify why data was being lost and fix it without disrupting the pipeline. Action: I analyzed CloudWatch logs and traced the issue to Lambda function timeouts on large files. I redesigned the pipeline to process files in chunks using S3 event notifications with prefix filters, added monitoring for Lambda errors and duration, and implemented dead-letter queues for failed invocations. Result: Data loss was eliminated, processing became 3x faster, and we had visibility into failures through CloudWatch alarms."],
          [127, "Describe a situation where you had to learn something quickly.", "Situation: At TefoLogic, I was assigned to automate infrastructure with Terraform, but I had limited hands-on experience. Task: I needed to become productive within two weeks. Action: I dedicated evenings to HashiCorp's official tutorials, practiced in a sandbox AWS account, and studied our existing Terraform codebase. I started with small modules and had senior engineers review my code. Result: Within two weeks, I was writing production Terraform code independently. I eventually created reusable VPC modules used across the team."],
          [128, "How do you handle working with conflicting opinions?", "Situation: During a project at TefoLogic, there was disagreement about whether to use CloudFormation or Terraform for IaC. Task: We needed to reach a decision that the whole team could support. Action: I researched both options objectively, created a comparison document highlighting pros and cons, and facilitated a discussion where everyone shared their perspective. I focused on technical facts \u2014 Terraform's multi-cloud support was crucial since we used both AWS and GCP. Result: The team agreed on Terraform, and the comparison document became our reference for future technology decisions."],
          [129, "Tell me about a time you made a mistake.", "Situation: Early in my TefoLogic internship, I accidentally applied a Terraform change to the wrong environment \u2014 I modified staging when I intended to update dev. Task: I needed to reverse the change without impacting other team members' work. Action: I immediately notified my supervisor, used terraform plan to understand the exact impact, then applied the correct configuration to restore staging. I then proposed adding environment-specific Terraform workspaces and requiring explicit environment selection in our CI/CD pipeline. Result: No lasting impact, and the safeguard I proposed prevented similar mistakes for the team."],
          [130, "Why cloud engineering at a financial exchange?", "Financial exchanges represent the highest bar for cloud engineering \u2014 near-zero downtime, microsecond latency requirements, stringent regulatory compliance, and massive data volumes during market hours. This pushes you to be the best at what you do. My cybersecurity background gives me an appreciation for the security demands of financial infrastructure. I want to work where cloud engineering decisions directly impact market integrity and investor confidence."],
          [131, "How do you stay updated with cloud technologies?", "I follow a structured approach: AWS and Azure official blogs for service announcements, r/aws and r/devops on Reddit for community discussions, hands-on labs in my personal AWS account, YouTube channels like TechWorld with Nana and NetworkChuck for visual learning, and CloudSecList newsletter for security updates. I also practice through Hack The Box challenges and building projects like SOAR-Lite. Continuous learning is essential because cloud services evolve rapidly."],
          [132, "Describe explaining a technical concept to a non-technical person.", "Situation: At TefoLogic, I needed to explain our cloud infrastructure costs to the finance team. Task: Make cloud billing understandable without technical jargon. Action: I used analogies \u2014 compared EC2 instances to renting office space (you pay for the size and duration), S3 to a storage unit (you pay for how much you store), and Lambda to a taxi meter (you pay only when you use it). I created a simple dashboard showing costs by service with trend lines. Result: The finance team understood where money was going and approved our proposal for Reserved Instances, saving 35% on compute costs."],
          [133, "How do you prioritize when multiple systems are down?", "Priority framework: 1. Business impact \u2014 what affects the most users or revenue? For TMX, trading systems during market hours always come first. 2. Blast radius \u2014 is the issue spreading? Stop the spread first. 3. Dependencies \u2014 fix upstream services before downstream. 4. Recovery time \u2014 if one fix takes 5 minutes and another takes 2 hours, do the quick fix first to reduce overall impact. I also believe in clear communication \u2014 assign one person per issue, provide status updates every 15 minutes, and escalate if not resolved within the expected timeframe."],
          [134, "Are you comfortable with on-call rotations?", "Yes, absolutely. On-call is a fundamental part of cloud engineering. I understand the responsibility \u2014 you're the first line of defense for production systems. I'm organized about it: I keep my laptop charged and accessible, I review runbooks before my rotation starts, and I make sure I understand the escalation path. For TMX specifically, I understand that market hours add urgency, and I'm prepared for that level of responsibility."],
          [135, "What do you know about TMX Group?", "TMX Group operates Canada's premier capital markets infrastructure. They run the Toronto Stock Exchange (TSX) for senior equities, TSX Venture Exchange for growth companies, the Montreal Exchange (MX) for derivatives, and Trayport for energy trading. They also provide clearing through CDCC and depository services through CDS. TMX is undergoing a cloud modernization journey, moving infrastructure to AWS and Azure. As a financial market operator, they're subject to strict regulatory oversight from organizations like OSFI and provincial securities commissions. Their systems must maintain near-zero downtime during market hours (9:30 AM \u2013 4:00 PM EST)."],
          [136, "How would you handle a production incident during market hours?", "Immediate response: 1. Acknowledge the alert and assess severity within 2 minutes. 2. If it impacts trading, declare SEV1 and start the incident bridge. 3. Follow the runbook \u2014 contain the issue first (failover, scale up, restart). 4. Communicate status to stakeholders every 5 minutes during SEV1. 5. Do NOT attempt risky fixes during market hours \u2014 use safe, proven remediation steps. 6. Document everything in real-time. 7. After market close, perform thorough root cause analysis. The key principle: stability over perfection during market hours."],
          [137, "Tell me about a time you automated a manual process.", "Situation: At TefoLogic, environment setup was manual \u2014 engineers spent hours configuring VPCs, subnets, and security groups through the AWS console. Task: Reduce setup time and eliminate configuration errors. Action: I created a Terraform module that encapsulated our standard VPC architecture. The module accepted variables for environment name, CIDR ranges, and tags, and created all networking components automatically. I also added it to our CI/CD pipeline so environment creation was triggered by a pull request. Result: Environment setup went from 3+ hours to 10 minutes, and we eliminated configuration drift between environments."],
          [138, "How do you approach learning a new cloud service?", "My framework: 1. Read the official documentation \u2014 understand the service's purpose, pricing, and limitations. 2. Watch a 20-minute overview video for visual understanding. 3. Follow a hands-on tutorial in my personal AWS account. 4. Build a small proof-of-concept that connects the service to something I already know. 5. Read best practices and common pitfalls. 6. Try to break it \u2014 understand failure modes. This is how I learned Terraform, Docker, and Flask. For TMX, I'd apply the same approach to any new service the team uses."],
          [139, "What is your biggest weakness?", "I tend to be overly thorough when investigating issues. During my internship, when debugging a cloud incident, I would sometimes spend extra time understanding the root cause even after the immediate fix was applied. While this built deep knowledge, I've learned to balance thoroughness with urgency \u2014 fix the immediate issue first, schedule the deep-dive RCA for later. In a time-sensitive environment like TMX during market hours, this prioritization is critical, and it's something I've actively improved."],
          [140, "Do you have questions for us?", "Yes! I always prepare questions: 1. What does the cloud modernization roadmap look like at TMX for the next year? 2. How does the team handle incident response during market hours? 3. What's the current AWS vs Azure split in your infrastructure? 4. How does the on-call rotation work for cloud engineers? 5. What growth opportunities exist \u2014 is there a path toward cloud architecture roles?"],
        ],
      },
    ],
  },
  {
    sectionTitle: "SECTION E: TMX-SPECIFIC QUESTIONS",
    subsections: [
      {
        title: "TMX Group & Financial Services (5 Questions)",
        questions: [
          [141, "What does TMX Group do?", "TMX Group is the operator of Canada's premier financial markets. They run the Toronto Stock Exchange (TSX) \u2014 the main exchange for established companies, TSX Venture Exchange \u2014 for early-stage growth companies, Montreal Exchange (MX) \u2014 Canada's derivatives exchange for options and futures, and Trayport \u2014 a global energy trading platform. They also operate clearing (CDCC) and depository services (CDS). TMX supports the entire lifecycle of capital markets \u2014 listing, trading, clearing, settlement, and data services."],
          [142, "Why is high availability critical for a stock exchange?", "A stock exchange outage has cascading effects: traders can't execute orders, market makers can't provide liquidity, listed companies can't raise capital, and investor confidence erodes. The financial impact of even a one-minute outage during peak trading can be millions of dollars in lost transactions and regulatory penalties. That's why TMX needs 99.999% availability during market hours, automated failover, geographic redundancy, and constant monitoring \u2014 and why this Cloud Engineer role is so important."],
          [143, "What compliance frameworks are important in financial services?", "Key frameworks: SOC 2 (security controls auditing), PCI-DSS (if handling payment data), OSFI guidelines (Office of the Superintendent of Financial Institutions \u2014 Canada's banking regulator), provincial securities commission requirements, ISO 27001 (information security management), NIST Cybersecurity Framework (risk management), and PIPEDA (Canadian privacy law). Cloud infrastructure must be designed with these in mind \u2014 encryption at rest and in transit, access logging, data residency in Canada, and regular security audits."],
          [144, "How does cloud security differ in financial services?", "Financial services have stricter requirements: Data residency \u2014 financial data must stay in Canada (use ca-central-1 region). Encryption everywhere \u2014 at rest (KMS) and in transit (TLS). Enhanced audit logging \u2014 every action must be traceable (CloudTrail, Config). Regulatory compliance \u2014 must meet OSFI, securities commission, and privacy requirements. Change management \u2014 all changes documented and approved. Third-party risk \u2014 cloud providers must meet security requirements. Separation of duties \u2014 no single person can deploy and approve."],
          [145, "What is the impact of a 1-minute outage at a stock exchange?", "During peak trading (market open/close), TSX processes thousands of orders per second. A 1-minute outage could mean: millions in unexecuted trades, market makers unable to provide liquidity (widening spreads), listed companies affected by disrupted price discovery, regulatory scrutiny and potential fines, reputation damage affecting future listings, and loss of confidence from institutional investors who may route to alternative exchanges. This is why cloud infrastructure for TMX must be designed for fault tolerance, with automated failover and multi-region redundancy."],
        ],
      },
    ],
  },
];

// =============== BUILD DOCUMENT ===============

const children = [];

// Title page
children.push(new Paragraph({ spacing: { before: 3000 } }));
children.push(makeTitle("INTERVIEW QUESTIONS BANK", 52, NAVY, 100));
children.push(makeTitle("145+ PREDICTED QUESTIONS", 40, ACCENT_BLUE, 400));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: NAVY } },
  children: [],
}));
children.push(new Paragraph({ spacing: { after: 200 } }));
children.push(makeTitle("Cloud Engineer (R-5764) \u2014 TMX Group", 30, NAVY, 200));
children.push(makeTitle("Every Question with Model Answer Tailored to Ravi\u2019s Experience", 24, MEDIUM_GRAY, 600, false));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 800 },
  children: [
    new TextRun({ text: "Prepared for Interview Success", font: FONT, size: 22, color: ACCENT_BLUE, italics: true }),
  ],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200 },
  children: [
    new TextRun({ text: "March 2026", font: FONT, size: 22, color: MEDIUM_GRAY }),
  ],
}));

children.push(pageBreakPara());

// Table of contents summary
children.push(makeTitle("TABLE OF CONTENTS", 32, NAVY, 300));
children.push(new Paragraph({ spacing: { after: 100 }, border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: NAVY } }, children: [] }));

const tocItems = [
  ["Section A", "JD-Based Questions (Q1\u2013Q75)", "65 Questions"],
  ["", "  AWS Services", "Q1\u2013Q15"],
  ["", "  Azure Basics", "Q16\u2013Q25"],
  ["", "  Terraform / IaC", "Q26\u2013Q35"],
  ["", "  Kubernetes / EKS / AKS", "Q36\u2013Q45"],
  ["", "  Networking & Security", "Q46\u2013Q55"],
  ["", "  CI/CD Pipelines", "Q56\u2013Q65"],
  ["", "  Incident Response & Monitoring", "Q66\u2013Q75"],
  ["Section B", "Resume-Based Questions (Q76\u2013Q95)", "20 Questions"],
  ["", "  TefoLogic Internship", "Q76\u2013Q85"],
  ["", "  Education", "Q86\u2013Q90"],
  ["", "  Technical Skills", "Q91\u2013Q95"],
  ["Section C", "Project-Based Questions (Q96\u2013Q125)", "30 Questions"],
  ["Section D", "Behavioral Questions (Q126\u2013Q140)", "15 Questions"],
  ["Section E", "TMX-Specific Questions (Q141\u2013Q145)", "5 Questions"],
];

for (const [label, desc, range] of tocItems) {
  children.push(new Paragraph({
    spacing: { after: 60 },
    children: [
      ...(label ? [new TextRun({ text: label + "  ", font: FONT, size: 22, color: NAVY, bold: true })] : []),
      new TextRun({ text: desc, font: FONT, size: 22, color: label ? DARK_GRAY : MEDIUM_GRAY }),
      new TextRun({ text: "  " + range, font: FONT, size: 20, color: ACCENT_BLUE }),
    ],
  }));
}

children.push(pageBreakPara());

// Build all sections
for (const section of sections) {
  children.push(sectionHeading(section.sectionTitle));
  children.push(new Paragraph({ spacing: { after: 200 } }));

  for (const sub of section.subsections) {
    children.push(subsectionHeading(sub.title));

    if (sub.note) {
      children.push(new Paragraph({
        spacing: { before: 200, after: 200 },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF8E1" },
        children: [
          new TextRun({ text: "Note: ", font: FONT, size: FONT_SIZE_BODY, color: NAVY, bold: true }),
          new TextRun({ text: sub.note, font: FONT, size: FONT_SIZE_BODY, color: DARK_GRAY, italics: true }),
        ],
      }));
    }

    for (const [qNum, question, answer] of sub.questions) {
      const qBlocks = questionBlock(qNum, question, answer);
      children.push(...qBlocks);
    }

    children.push(new Paragraph({ spacing: { after: 100 } }));
  }

  children.push(pageBreakPara());
}

// Final page
children.push(new Paragraph({ spacing: { before: 2000 } }));
children.push(makeTitle("END OF QUESTION BANK", 36, NAVY, 200));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT_BLUE } },
  children: [],
}));
children.push(new Paragraph({ spacing: { after: 400 } }));
children.push(makeTitle("145 Questions \u2022 Complete Model Answers \u2022 Tailored to Ravi\u2019s Experience", 22, MEDIUM_GRAY, 200, false));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200 },
  children: [
    new TextRun({ text: "Good luck with the interview!", font: FONT, size: 26, color: ACCENT_BLUE, bold: true }),
  ],
}));

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: FONT,
          size: FONT_SIZE_BODY,
          color: DARK_GRAY,
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
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
                  text: "TMX Cloud Engineer \u2014 Interview Prep",
                  font: FONT,
                  size: 18,
                  color: MEDIUM_GRAY,
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
                  size: 18,
                  color: MEDIUM_GRAY,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT,
                  size: 18,
                  color: MEDIUM_GRAY,
                }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("C:/Users/jayar/OneDrive/Desktop/Ravi kiran/03_Interview_Questions_Bank.docx", buffer);
  console.log("Document created successfully: 03_Interview_Questions_Bank.docx");
  console.log("Total questions included: 145 (Q1-Q95 with full answers, Q96-Q125 referenced, Q126-Q145 with full answers)");
});
