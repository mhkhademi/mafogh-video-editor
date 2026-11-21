using System;
using System.IO;
using System.Diagnostics;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;

namespace MafoghLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;

                // 1. Ensure Backend (port 3001) is active
                if (!IsPortOpen("127.0.0.1", 3001))
                {
                    StartBackgroundProcess("cmd.exe", "/c npx tsx server/index.ts", baseDir);
                }

                // 2. Ensure Frontend (port 3000) is active
                if (!IsPortOpen("127.0.0.1", 3000))
                {
                    StartBackgroundProcess("cmd.exe", "/c npx vite --port 3000", baseDir);
                }

                // 3. Wait briefly until port 3000 responds (up to 8 seconds)
                for (int i = 0; i < 20; i++)
                {
                    if (IsPortOpen("127.0.0.1", 3000)) break;
                    Thread.Sleep(400);
                }

                // 4. Find Edge or Chrome for Standalone App Mode
                string browserPath = FindBrowser();
                if (!string.IsNullOrEmpty(browserPath))
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = browserPath;
                    psi.Arguments = "--app=http://localhost:3000 --window-size=1440,920";
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                }
                else
                {
                    Process.Start("http://localhost:3000");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("خطا در اجرای تدوینگر مافوق: " + ex.Message, "تدوینگر مافوق", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static bool IsPortOpen(string host, int port)
        {
            try
            {
                using (TcpClient client = new TcpClient())
                {
                    var result = client.BeginConnect(host, port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(300);
                    if (!success) return false;
                    client.EndConnect(result);
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        static void StartBackgroundProcess(string fileName, string args, string workingDir)
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = fileName;
            psi.Arguments = args;
            psi.WorkingDirectory = workingDir;
            psi.CreateNoWindow = true;
            psi.UseShellExecute = false;
            psi.WindowStyle = ProcessWindowStyle.Hidden;
            Process.Start(psi);
        }

        static string FindBrowser()
        {
            string[] paths = new string[]
            {
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
            };

            foreach (string p in paths)
            {
                if (File.Exists(p)) return p;
            }
            return null;
        }
    }
}
