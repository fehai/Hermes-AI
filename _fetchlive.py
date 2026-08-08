import urllib.request
url='https://fehai.github.io/Hermes-AI/assets/knight.png'
try:
    data=urllib.request.urlopen(url, timeout=30).read()
    open('C:/temp/live_knight.png','wb').write(data)
    print('downloaded', len(data), 'bytes; magic', data[:8])
    print('valid PNG' if data[:8]==b'\x89PNG\r\n\x1a\n' else 'NOT VALID PNG (corrupted)')
    print('contains CRLF:', b'\r\n' in data)
except Exception as e:
    print('ERR', e)
