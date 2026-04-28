---
title: "Step Up Your Firmware Game with Binwalk v3: Features and Tips"
date: "2024-09-25"
description: "Unlock the full potential of Binwalk v3, the latest version of the leading firmware analysis tool. This post highlights key features, enhanced extraction techniques, and tips to improve your reverse engineering skills."
tags: ["binwalk", "firmware reversing", "firmware extraction", "reverse engineering"]
---

Binwalk v3 (https://github.com/ReFirmLabs/binwalk) is the latest version of the powerful firmware analysis tool widely used by security researchers, reverse engineers, and embedded systems developers. It provides advanced features for extracting, analyzing, and exploring firmware images, making it a go-to solution for anyone working with embedded device security. This guide will highlight the key features of Binwalk v3 and offer practical tips to maximize its potential.

The major change in Binwalk v3 is that it has been re-written in Rust, marking a significant update to the firmware analysis tool. This version is currently unstable and considered experimental, but it introduces several notable improvements. Although the usage and output are similar to previous Binwalk releases, the re-write brings enhanced performance and reliability, thanks to the benefits of Rust's memory safety and concurrency features.



### <span style="color: orange;">What is Binwalk?</span>

Binwalk is a firmware analysis tool that allows users to identify, extract, and reverse engineer embedded files and executable code within firmware images. It is an essential tool for cybersecurity professionals, enabling them to dig into the inner workings of various hardware devices.

### <span style="color: orange;">Differences between versions</span>

| Feature/Version         | Binwalk 1.0.0                 | Binwalk 2.3.3                  | Binwalk 3.0 (Rust Version)       |
|-------------------------|--------------------------------|---------------------------------|-----------------------------------|
| **Release Year**        | 2010                           | 2021                            | 2023 (unstable/experimental)     |
| **Signature Matching**  | Basic magic signature matching | Improved signature database     | Smart matching with confidence     |
| **Performance**         | Slower analysis                | Multi-core processing           | Significantly faster on large firmware                   |
| **Output Format**       | Standard text output           | Standard text output            | JSON output support                |
| **Platform Support**    | Limited to Linux               | Limited to Linux                | 64-bit Linux only                  |
| **Entropy Analysis**     | Not available                  | Basic entropy analysis          | Enhanced entropy graphs            |
| **Extraction Capability**| Basic extraction              | Improved extraction for file systems | Advanced extraction methods        |

### <span style="color: orange;">Choose binwalk-v2 from OSPG repo</span>


To install the updated and stable binwalk maintained by OSPG, ensure you have the correct dependencies and follow the installation instructions provided in the repository. After cloning the repository, check that all required libraries and utilities are installed properly. It’s essential to verify each step to avoid issues during execution.

OSPG Binwalk Github Repo : [binwalk](https://github.com/OSPG/binwalk)


### <span style="color: orange;">Key Features of Binwalk v3</span>

1. **Improved Extraction Capabilities**
2. **Enhanced Scanning Options**
3. **Seamless Integration with Other Tools**
4. **User-Friendly Command Line Interface**
5. **Active Community and Continuous Updates**


### <span style="color: orange;">Getting Started with Binwalk v3</span>

To get started with Binwalk v3, you can clone the repository and install it using the following commands:

Follow the binwalk wiki : https://github.com/ReFirmLabs/binwalk/wiki#usage

##### <span style="color: orange;">Step 1: </span>install rustup (as i am ubuntu user i installed from snap package)

```bash
sudo snap install rustup
```

##### <span style="color: orange;">Step 2: </span>install dependencies , copy and save as bash script and
  run it (do it on your own risk.. haha)

```bash
sudo ./binwalk/dependencies/ubuntu.sh
```

##### <span style="color: orange;">Step 3 </span>: clone the repository and install 

```bash
sudo apt install git
git clone -b binwalkv3 https://github.com/ReFirmLabs/binwalk.git
cd binwalk
cargo build --release
./target/release/binwalk --help
```

##### <span style="color: orange;">Step 4 </span>: copy binwalk from target/release/binwalk to preferred location , in my case /usr/local/bin/

```bash
sudo cp -r target/release/binwalk /usr/local/bin/
```

Tada... Task completed

![](/blog/binwalkv3/Tada.gif)

### <span style="color: orange;">Usage guide</span>

List all signatures and required extraction utilities:

```
mr-iot@v:~$ binwalk --list 
-------------------------------------------------------------------------------------------------------
Signature Description              Signature Name                     Extraction Utility
-------------------------------------------------------------------------------------------------------
7-zip archive data                 7zip                               7z
Android sparse image               android_sparse                     Built-in
Apple Disk iMaGe                   dmg                                7z
Arcadyan obfuscated LZMA           arcadyan                           Built-in
bzip2 compressed data              bzip2                              7z
CFE bootloader                     cfe                                None
CHK firmware header                chk                                None
compress'd data                    compressd                          7z
Copyright text                     copyright                          None
CPIO ASCII archive                 cpio                               7z
CramFS filesystem                  cramfs                             7z
CRC32 polynomial table             crc32                              None
Debian package file                deb                                None
Device tree blob (DTB)             dtb                                dtc
DLOB firmware header               dlob                               None
eCos kernel exception handler      ecos                               None
ELF binary                         elf                                None
EXT filesystem                     ext                                tsk_recover
GPG signed file                    gpg_signed                         Built-in
gzip compressed data               gzip                               Built-in
Intel serial flash for PCH ROM     pchrom                             uefi-firmware-parser
ISO9660 primary volume             iso9660                            tsk_recover
JFFS2 filesystem                   jffs2                              jefferson
JPEG image                         jpeg                               Built-in
Linux kernel boot image            linux_boot_image                   None
Linux kernel version               linux_kernel_version               None
LZ4 compressed data                lz4                                lz4
LZMA compressed data               lzma                               Built-in
LZO compressed data                lzop                               lzop
Microsoft Cabinet archive          cab                                cabextract
Motorola S-record                  srecord                            srec2bin
Motorola S-record (generic)        srecord_generic                    srec2bin
OpenSSL encryption                 openssl                            None
PackImg firmware header            packimg                            None
PDF document                       pdf                                None
PEM certificate                    pem_certificate                    Built-in
PEM private key                    pem_private_key                    Built-in
PEM public key                     pem_public_key                     Built-in
PNG image                          png                                Built-in
POSIX tar archive                  tarball                            tar
QNX IFS image                      qnx_ifs                            dumpifs
RAR archive                        rar                                unrar
RIFF image                         riff                               Built-in
RomFS filesystem                   romfs                              Built-in
SEAMA firmware header              seama                              None
SHA256 hash constants              sha256                             None
SquashFS filesystem                squashfs                           sasquatch
TRX firmware header                trx                                None
UBI image                          ubi                                ubireader_extract_images
UBIFS image                        ubifs                              ubireader_extract_files
UEFI capsule image                 uefi_capsule                       uefi-firmware-parser
UEFI PI firmware volume            ueif_pi_volume                     uefi-firmware-parser
uImage firmware header             uimage                             None
VxWorks symbol table               vxworks_symtab                     Built-in
VxWorks WIND kernel version        wind_kernel                        None
Windows PE binary                  pe                                 None
XZ compressed data                 xz                                 7z
YAFFS filesystem                   yaffs                              tsk_recover
ZIP archive                        zip                                unzip
Zlib compressed file               zlib                               Built-in
ZSTD compressed data               zstd                               zstd
-------------------------------------------------------------------------------------------------------

Total signatures: 61
Extractable signatures: 42
```

Scan a file's contents:

```
binwalk file_name.bin
```

Exclude specific signatures from a scan:

```
binwalk --exclude=jpeg,png,pdf file_name.bin
```

Only serch for specific signatures during a scan:

```
binwalk --include=jpeg,png,pdf file_name.bin
```

Scan a file and extract its contents (default output directory is `extractions`):

```
binwalk -e file_name.bin
```

Recursively scan and extract a file's contents:

```
binwalk -Mev file_name.bin
```

![](/blog/binwalkv3/use.gif)

Generate an entropy graph of the specified file (a PNG image will be saved to the current working directory):

```
mr-iot@v:~$ binwalk -E squashfs.bin 
Calculating file entropy...entropy graph saved to: squashfs.bin.png
```
![](/blog/binwalkv3/TEST123.bin.png)

Save signature or entropy analysis results to a JSON file:

```
binwalk --log=results.json file_name.bin
```

##### <span style="color: orange;">Conclusion: </span>

Binwalk is an impressive and powerful tool for firmware analysis, widely used by hackers and researchers. The upcoming v3.0, though currently experimental, promises significant improvements in speed and accuracy, thanks to its Rust rewrite. It’s exciting to anticipate how future updates will enhance its capabilities, offering even more valuable features for security researchers.
