using System;
using System.IO;
using System.Drawing;
using System.Diagnostics;
using System.Windows.Forms;
using System.Threading;

namespace MafoghSetup
{
    public class SetupForm : Form
    {
        private Panel headerPanel;
        private Label titleLabel;
        private Label subTitleLabel;
        private Panel contentPanel;
        private Panel footerPanel;
        private Button btnNext;
        private Button btnCancel;
        private CheckBox chkDesktop;
        private CheckBox chkStartMenu;
        private TextBox txtPath;
        private ProgressBar progressBar;
        private Label lblStatus;
        private CheckBox chkLaunchNow;
        private int step = 1;

        public SetupForm()
        {
            this.Text = "نصب‌کننده نرم‌افزار تدوینگر مافوق";
            this.Size = new Size(560, 440);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.RightToLeft = RightToLeft.Yes;
            this.RightToLeftLayout = true;
            this.BackColor = Color.FromArgb(15, 23, 42); // slate-900
            this.Font = new Font("Tahoma", 9F, FontStyle.Regular);

            string icoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"installer\mafogh.ico");
            if (File.Exists(icoPath))
            {
                try { this.Icon = new Icon(icoPath); } catch {}
            }

            InitComponents();
            ShowStep1();
        }

        private void InitComponents()
        {
            // Header
            headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 80;
            headerPanel.BackColor = Color.FromArgb(107, 11, 69); // Mafogh #6b0b45
            headerPanel.Paint += (s, e) => {
                using (var brush = new System.Drawing.Drawing2D.LinearGradientBrush(
                    headerPanel.ClientRectangle,
                    Color.FromArgb(107, 11, 69),
                    Color.FromArgb(49, 10, 52),
                    0F))
                {
                    e.Graphics.FillRectangle(brush, headerPanel.ClientRectangle);
                }
            };

            titleLabel = new Label();
            titleLabel.Text = "تدوینگر ارائه‌های ویدیویی مافوق";
            titleLabel.ForeColor = Color.White;
            titleLabel.Font = new Font("Tahoma", 12F, FontStyle.Bold);
            titleLabel.AutoSize = true;
            titleLabel.Location = new Point(20, 16);
            titleLabel.BackColor = Color.Transparent;

            subTitleLabel = new Label();
            subTitleLabel.Text = "نرم‌افزار هوشمند و پرسرعت تولید ویدیوهای پرزنتیشن";
            subTitleLabel.ForeColor = Color.FromArgb(244, 214, 235);
            subTitleLabel.Font = new Font("Tahoma", 8.5F);
            subTitleLabel.AutoSize = true;
            subTitleLabel.Location = new Point(20, 44);
            subTitleLabel.BackColor = Color.Transparent;

            headerPanel.Controls.Add(titleLabel);
            headerPanel.Controls.Add(subTitleLabel);

            string pngPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"installer\mafogh.png");
            if (File.Exists(pngPath))
            {
                try
                {
                    PictureBox pic = new PictureBox();
                    pic.Image = Image.FromFile(pngPath);
                    pic.SizeMode = PictureBoxSizeMode.Zoom;
                    pic.Size = new Size(54, 54);
                    pic.Location = new Point(480, 13);
                    pic.BackColor = Color.Transparent;
                    headerPanel.Controls.Add(pic);
                }
                catch {}
            }

            // Footer
            footerPanel = new Panel();
            footerPanel.Dock = DockStyle.Bottom;
            footerPanel.Height = 60;
            footerPanel.BackColor = Color.FromArgb(10, 15, 29);

            btnCancel = new Button();
            btnCancel.Text = "انصراف";
            btnCancel.Size = new Size(85, 32);
            btnCancel.Location = new Point(20, 14);
            btnCancel.ForeColor = Color.FromArgb(203, 213, 225);
            btnCancel.BackColor = Color.FromArgb(30, 41, 59);
            btnCancel.FlatStyle = FlatStyle.Flat;
            btnCancel.FlatAppearance.BorderColor = Color.FromArgb(51, 65, 85);
            btnCancel.Cursor = Cursors.Hand;
            btnCancel.Click += (s, e) => { this.Close(); };

            btnNext = new Button();
            btnNext.Text = "نصب برنامه";
            btnNext.Size = new Size(120, 32);
            btnNext.Location = new Point(115, 14);
            btnNext.ForeColor = Color.White;
            btnNext.BackColor = Color.FromArgb(219, 39, 119); // Pink-600
            btnNext.FlatStyle = FlatStyle.Flat;
            btnNext.FlatAppearance.BorderColor = Color.FromArgb(236, 72, 153);
            btnNext.Font = new Font("Tahoma", 9F, FontStyle.Bold);
            btnNext.Cursor = Cursors.Hand;
            btnNext.Click += BtnNext_Click;

            footerPanel.Controls.Add(btnCancel);
            footerPanel.Controls.Add(btnNext);

            // Content Panel
            contentPanel = new Panel();
            contentPanel.Dock = DockStyle.Fill;
            contentPanel.Padding = new Padding(25);
            contentPanel.BackColor = Color.FromArgb(15, 23, 42);

            this.Controls.Add(contentPanel);
            this.Controls.Add(footerPanel);
            this.Controls.Add(headerPanel);
        }

        private void ShowStep1()
        {
            contentPanel.Controls.Clear();
            step = 1;
            btnNext.Text = "نصب تدوینگر مافوق";
            btnNext.Enabled = true;

            Label lblWelcome = new Label();
            lblWelcome.Text = "به برنامه نصب تدوینگر مافوق خوش آمدید.\nاین جادوگر، برنامه را روی سیستم شما راه‌اندازی و میانبرهای لازم را ایجاد می‌کند.";
            lblWelcome.ForeColor = Color.FromArgb(226, 232, 240);
            lblWelcome.Location = new Point(20, 15);
            lblWelcome.Size = new Size(500, 45);

            Label lblPath = new Label();
            lblPath.Text = "مسیر پروژه و برنامه:";
            lblPath.ForeColor = Color.FromArgb(148, 163, 184);
            lblPath.Location = new Point(20, 70);
            lblPath.AutoSize = true;

            txtPath = new TextBox();
            txtPath.Text = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\');
            txtPath.Location = new Point(20, 95);
            txtPath.Size = new Size(500, 26);
            txtPath.ReadOnly = true;
            txtPath.BackColor = Color.FromArgb(30, 41, 59);
            txtPath.ForeColor = Color.FromArgb(241, 245, 249);
            txtPath.BorderStyle = BorderStyle.FixedSingle;

            chkDesktop = new CheckBox();
            chkDesktop.Text = "ایجاد میانبر روی دسکتاپ (Desktop Shortcut)";
            chkDesktop.Checked = true;
            chkDesktop.ForeColor = Color.White;
            chkDesktop.Location = new Point(20, 140);
            chkDesktop.Size = new Size(400, 26);
            chkDesktop.Cursor = Cursors.Hand;

            chkStartMenu = new CheckBox();
            chkStartMenu.Text = "ایجاد میانبر در منوی استارت ویندوز (Start Menu)";
            chkStartMenu.Checked = true;
            chkStartMenu.ForeColor = Color.White;
            chkStartMenu.Location = new Point(20, 175);
            chkStartMenu.Size = new Size(400, 26);
            chkStartMenu.Cursor = Cursors.Hand;

            contentPanel.Controls.Add(lblWelcome);
            contentPanel.Controls.Add(lblPath);
            contentPanel.Controls.Add(txtPath);
            contentPanel.Controls.Add(chkDesktop);
            contentPanel.Controls.Add(chkStartMenu);
        }

        private void ShowStep2Installing()
        {
            contentPanel.Controls.Clear();
            step = 2;
            btnNext.Enabled = false;
            btnCancel.Enabled = false;

            lblStatus = new Label();
            lblStatus.Text = "در حال آماده‌سازی و راه‌اندازی نرم‌افزار...";
            lblStatus.ForeColor = Color.FromArgb(244, 114, 182); // Pink-400
            lblStatus.Font = new Font("Tahoma", 9.5F, FontStyle.Bold);
            lblStatus.Location = new Point(20, 40);
            lblStatus.Size = new Size(500, 30);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(20, 80);
            progressBar.Size = new Size(500, 22);
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Value = 10;

            Label lblDetails = new Label();
            lblDetails.Text = "لطفاً چند لحظه شکیبا باشید. میانبرهای رسمی و تنظیمات اجرایی در حال ثبت هستند.";
            lblDetails.ForeColor = Color.FromArgb(148, 163, 184);
            lblDetails.Location = new Point(20, 120);
            lblDetails.Size = new Size(500, 40);

            contentPanel.Controls.Add(lblStatus);
            contentPanel.Controls.Add(progressBar);
            contentPanel.Controls.Add(lblDetails);

            // Execute Installation in Background
            Thread t = new Thread(PerformInstall);
            t.IsBackground = true;
            t.Start();
        }

        private void PerformInstall()
        {
            try
            {
                Thread.Sleep(500);
                UpdateProgress(35, "در حال ایجاد فایل اجرایی Mafogh.exe...");

                string baseDir = txtPath.Text;
                string exePath = Path.Combine(baseDir, "Mafogh.exe");

                Thread.Sleep(500);
                UpdateProgress(65, "در حال ساخت میانبرهای دسکتاپ و استارت...");

                if (chkDesktop.Checked)
                {
                    string desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                    string lnk = Path.Combine(desktop, "تدوینگر مافوق.lnk");
                    CreateShortcut(lnk, exePath, baseDir, "تدوینگر ارائه‌های ویدیویی مافوق");
                }

                if (chkStartMenu.Checked)
                {
                    string startMenu = Environment.GetFolderPath(Environment.SpecialFolder.StartMenu);
                    string programs = Path.Combine(startMenu, "Programs");
                    string lnk = Path.Combine(programs, "تدوینگر مافوق.lnk");
                    CreateShortcut(lnk, exePath, baseDir, "تدوینگر ارائه‌های ویدیویی مافوق");
                }

                Thread.Sleep(600);
                UpdateProgress(100, "نصب با موفقیت تکمیل شد!");

                this.Invoke((Action)(() => {
                    ShowStep3Complete();
                }));
            }
            catch (Exception ex)
            {
                this.Invoke((Action)(() => {
                    MessageBox.Show("خطا در فرآیند نصب: " + ex.Message, "خطای ستاپ", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    this.Close();
                }));
            }
        }

        private void UpdateProgress(int val, string status)
        {
            if (this.InvokeRequired)
            {
                this.Invoke((Action)(() => UpdateProgress(val, status)));
                return;
            }
            progressBar.Value = val;
            lblStatus.Text = status;
        }

        private void ShowStep3Complete()
        {
            contentPanel.Controls.Clear();
            step = 3;
            btnNext.Text = "پایان";
            btnNext.Enabled = true;
            btnCancel.Visible = false;

            Label lblDone = new Label();
            lblDone.Text = "✓ نصب تدوینگر مافوق با موفقیت به پایان رسید!";
            lblDone.ForeColor = Color.FromArgb(52, 211, 153); // Emerald-400
            lblDone.Font = new Font("Tahoma", 11F, FontStyle.Bold);
            lblDone.Location = new Point(20, 30);
            lblDone.Size = new Size(500, 35);

            Label lblDesc = new Label();
            lblDesc.Text = "میانبر برنامه روی دسکتاپ و منوی استارت ویندوز قرار گرفت.\nاز این پس مسئول مربوطه تنها با یک دابل‌کلیک می‌تواند برنامه را باز کند.";
            lblDesc.ForeColor = Color.FromArgb(203, 213, 225);
            lblDesc.Location = new Point(20, 75);
            lblDesc.Size = new Size(500, 50);

            chkLaunchNow = new CheckBox();
            chkLaunchNow.Text = "اجرای تدوینگر مافوق همین حالا (Launch Mafogh Editor)";
            chkLaunchNow.Checked = true;
            chkLaunchNow.ForeColor = Color.White;
            chkLaunchNow.Location = new Point(20, 150);
            chkLaunchNow.Size = new Size(400, 26);
            chkLaunchNow.Cursor = Cursors.Hand;

            contentPanel.Controls.Add(lblDone);
            contentPanel.Controls.Add(lblDesc);
            contentPanel.Controls.Add(chkLaunchNow);
        }

        private void BtnNext_Click(object sender, EventArgs e)
        {
            if (step == 1)
            {
                ShowStep2Installing();
            }
            else if (step == 3)
            {
                if (chkLaunchNow != null && chkLaunchNow.Checked)
                {
                    string exePath = Path.Combine(txtPath.Text, "Mafogh.exe");
                    if (File.Exists(exePath))
                    {
                        ProcessStartInfo psi = new ProcessStartInfo(exePath);
                        psi.WorkingDirectory = txtPath.Text;
                        Process.Start(psi);
                    }
                }
                this.Close();
            }
        }

        private static void CreateShortcut(string shortcutPath, string targetPath, string workingDir, string description)
        {
            Type t = Type.GetTypeFromProgID("WScript.Shell");
            dynamic shell = Activator.CreateInstance(t);
            dynamic shortcut = shell.CreateShortcut(shortcutPath);
            shortcut.TargetPath = targetPath;
            shortcut.WorkingDirectory = workingDir;
            shortcut.Description = description;

            string customIcon = Path.Combine(workingDir, @"installer\mafogh.ico");
            if (File.Exists(customIcon))
            {
                shortcut.IconLocation = customIcon + ",0";
            }
            else if (File.Exists(targetPath))
            {
                shortcut.IconLocation = targetPath + ",0";
            }
            else if (File.Exists(@"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"))
            {
                shortcut.IconLocation = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe,0";
            }
            else if (File.Exists(@"C:\Program Files\Google\Chrome\Application\chrome.exe"))
            {
                shortcut.IconLocation = @"C:\Program Files\Google\Chrome\Application\chrome.exe,0";
            }

            shortcut.Save();
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }
    }
}
