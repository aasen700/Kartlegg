#!/usr/bin/env python3
"""Account integration test on real Chromium, localhost, synthetic data and fake backend only."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import threading, shutil, subprocess, re, sys, tempfile
root=Path(__file__).resolve().parents[2]
source=(root/'index.html').read_text()
source=source.replace('<script type="module" src="assets/account/entry.mjs?v=raskt1"></script>','<script type="module" src="tests/account/browser.mjs"></script>')
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
 def do_GET(self):
  if self.path=='/account-test':
   self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write(source.encode())
  else:super().do_GET()
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
chrome=shutil.which('google-chrome') or shutil.which('chromium')
if not chrome:raise SystemExit('Requires Chrome or Chromium')
with tempfile.TemporaryDirectory() as tmp:
 run=subprocess.run([chrome,'--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',f'--user-data-dir={tmp}','--virtual-time-budget=10000','--dump-dom',f'http://127.0.0.1:{server.server_port}/account-test'],capture_output=True,text=True,timeout=45)
server.shutdown()
m=re.search(r'<pre id="account-test-result">(.*?)</pre>',run.stdout,re.S)
if not m:print(run.stderr[-3000:]);raise SystemExit('No account test result')
print(m.group(1))
if not m.group(1).startswith('PASS:'):sys.exit(1)
