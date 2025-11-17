function isMobileDevice(session) {
    if (!session || !session.DeviceName) return false;
    const deviceName = session.DeviceName.toLowerCase();
    const clientName = (session.Client || '').toLowerCase();

    return deviceName.includes('mobile') ||
           deviceName.includes('android') ||
           deviceName.includes('ios') ||
           deviceName.includes('iphone') ||
           deviceName.includes('ipad') ||
           clientName.includes('mobile') ||
           clientName.includes('android') ||
           clientName.includes('ios');
}

module.exports = {
    isMobileDevice
};
