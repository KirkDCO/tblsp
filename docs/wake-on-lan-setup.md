# Wake-on-LAN Setup for NUC

When a computer is asleep, it doesn't listen for HTTP traffic. Waking a remote machine requires **Wake-on-LAN (WOL)**, which uses a special "magic packet" sent to the network adapter.

## Solutions

### 1. Enable Wake-on-LAN on the NUC

#### BIOS/UEFI Settings
- Enter BIOS (usually F2 during boot)
- Look for "Wake on LAN" or "Power > Wake on LAN" and enable it

#### Linux (Fedora) Settings

```bash
# Check current WOL status
sudo ethtool eth0 | grep Wake-on

# Enable WOL (replace eth0 with your interface name)
sudo ethtool -s eth0 wol g

# Make it persistent via systemd/NetworkManager
sudo nmcli connection modify "Wired connection 1" 802-3-ethernet.wake-on-lan magic
```

### 2. Send a Wake Packet Before Accessing

From another machine on your network:

```bash
# Install wakeonlan tool
sudo dnf install wol

# Wake the NUC (use its MAC address)
wol AA:BB:CC:DD:EE:FF
```

To find the NUC's MAC address (run on the NUC):
```bash
ip link show
```

### 3. Prevent Sleep Instead

If you want the NUC always available, disable sleep entirely:

```bash
# Disable suspend/sleep
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target

# To re-enable later:
sudo systemctl unmask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

### 4. Use Power Settings

Configure power settings to only turn off the display but keep the system running:

```bash
# Using GNOME settings (if applicable)
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'
```

## Recommendation

If the NUC is serving the tblsp application, **option 3 (disabling sleep)** is the simplest approach. Servers typically shouldn't sleep.
