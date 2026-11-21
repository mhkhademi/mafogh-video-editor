using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;

namespace MakeIcon
{
    class Program
    {
        static void Main()
        {
            int size = 256;
            using (Bitmap bmp = new Bitmap(size, size, System.Drawing.Imaging.PixelFormat.Format32bppArgb))
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.Clear(Color.Transparent);

                // 1. Draw rounded squircle background with Mafogh luxury gradient
                int margin = 8;
                int rectSize = size - (margin * 2);
                Rectangle rect = new Rectangle(margin, margin, rectSize, rectSize);
                int radius = 56;

                using (GraphicsPath path = GetRoundedRect(rect, radius))
                using (LinearGradientBrush brush = new LinearGradientBrush(
                    new Point(margin, margin),
                    new Point(margin + rectSize, margin + rectSize),
                    Color.FromArgb(157, 23, 77),   // Rich Pink-700
                    Color.FromArgb(107, 11, 69)))  // Deep Mafogh #6b0b45
                {
                    g.FillPath(brush, path);
                }

                // 2. Inner border glow
                using (GraphicsPath path = GetRoundedRect(rect, radius))
                using (Pen pen = new Pen(Color.FromArgb(90, 244, 114, 182), 2.5f))
                {
                    g.DrawPath(pen, path);
                }

                // 3. Draw iconic Mafogh Crescent / Spiral Logo mark (scaled to 256)
                // Center point ~ (128, 128)
                float scale = 0.38f;
                float offX = 30f;
                float offY = 30f;

                using (SolidBrush whiteBrush = new SolidBrush(Color.White))
                {
                    // Center Top Dot
                    float dotX = offX + (186.4f * scale);
                    float dotY = offY + (170.93f * scale);
                    float dotR = 46.15f * scale;
                    g.FillEllipse(whiteBrush, dotX - dotR, dotY - dotR, dotR * 2, dotR * 2);

                    // Outer arc ring of Mafogh mark
                    using (Pen thickPen = new Pen(Color.White, 16f))
                    {
                        thickPen.StartCap = LineCap.Round;
                        thickPen.EndCap = LineCap.Round;
                        g.DrawArc(thickPen, 52, 52, 152, 152, 45, 270);
                    }

                    using (Pen innerPen = new Pen(Color.White, 12f))
                    {
                        innerPen.StartCap = LineCap.Round;
                        innerPen.EndCap = LineCap.Round;
                        g.DrawArc(innerPen, 80, 80, 96, 96, 210, 260);
                    }
                }

                // Convert to real Windows Icon
                IntPtr hIcon = bmp.GetHicon();
                using (Icon ico = Icon.FromHandle(hIcon))
                using (FileStream fs = new FileStream(@"installer\mafogh.ico", FileMode.Create))
                {
                    ico.Save(fs);
                }

                bmp.Save(@"installer\mafogh.png", System.Drawing.Imaging.ImageFormat.Png);
                Console.WriteLine("SUCCESS: installer\\mafogh.ico created successfully!");
            }
        }

        static GraphicsPath GetRoundedRect(Rectangle bounds, int radius)
        {
            int diameter = radius * 2;
            Size size = new Size(diameter, diameter);
            Rectangle arc = new Rectangle(bounds.Location, size);
            GraphicsPath path = new GraphicsPath();

            if (radius == 0)
            {
                path.AddRectangle(bounds);
                return path;
            }

            // top left
            path.AddArc(arc, 180, 90);
            // top right
            arc.X = bounds.Right - diameter;
            path.AddArc(arc, 270, 90);
            // bottom right
            arc.Y = bounds.Bottom - diameter;
            path.AddArc(arc, 0, 90);
            // bottom left
            arc.X = bounds.Left;
            path.AddArc(arc, 90, 90);

            path.CloseFigure();
            return path;
        }
    }
}
