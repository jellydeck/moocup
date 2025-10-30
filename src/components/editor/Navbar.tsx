import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import upiQR from "/assets/upiQR.png";
import {
  Download,
  ChevronDown,
  Coffee,
  ExternalLink,
  Loader2,
  QrCode,
  Heart,
  Twitter,
  X,
  CheckCircle,
  Github,
} from "lucide-react";
import { toast } from "sonner";
import { useMockupStore } from "@/contexts/MockupContext";
import html2canvas from "html2canvas";

export function Navbar() {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState("PNG");
  const [quality, setQuality] = useState([2]);
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { uploadedImage, imageBorder, fixedMargin, margin } = useMockupStore();

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;

  const getQualityLabel = (value) => {
    switch (value) {
      case 1:
        return "Standard (1x)";
      case 2:
        return "High (2x)";
      case 3:
        return "Ultra (3x)";
      default:
        return `${value}x`;
    }
  };

  const exportImage = async (format: string, qualityMultiplier: number) => {
    if (!uploadedImage) return;

    try {
      const mockupElement = document.querySelector(
        "[data-mockup-canvas]",
      ) as HTMLDivElement;
      if (!mockupElement) throw new Error("Mockup canvas not found");

      const imgElement = mockupElement.querySelector("img") as HTMLImageElement;
      if (!imgElement) throw new Error("Image element not found");

      // For fixed margin mode: capture the entire canvas (image + background margins)
      const canvas = await html2canvas(mockupElement, {
        scale: qualityMultiplier * 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        // Capture the entire mockup element without any cropping
      });

      const mimeType = `image/${format.toLowerCase()}`;
      const imageQuality = format === "JPEG" ? 1 : undefined;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mockup-${Date.now()}.${format.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } else {
            throw new Error("Failed to create blob");
          }
        },
        mimeType,
        imageQuality,
      );
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  const handleSingleExport = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setIsExporting(true);
    try {
      await exportImage(exportFormat, quality[0]);
      toast.success(`Successfully exported as ${exportFormat}!`, {
        icon: <CheckCircle className="w-4 h-4" />,
      });
    } catch (error) {
      toast.error("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleAllFormatsExport = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setIsExporting(true);
    const formats = ["PNG", "JPEG", "WebP"];
    const qualityMultiplier = quality[0];

    try {
      await Promise.all(
        formats.map((format) => exportImage(format, qualityMultiplier)),
      );

      toast.success(
        `Successfully exported all formats (${formats.join(", ")})!`,
        {
          icon: <CheckCircle className="w-4 h-4" />,
        },
      );
    } catch (error) {
      console.error("Export all formats error:", error);
      toast.error("Failed to export some formats. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const ExportOptionsContent = () => (
    <div
      className={`
        ${isMobile ? "flex flex-col gap-2" : "grid grid-cols-2 gap-6"}
      `}
    >
      <div className={`${!isMobile ? "order-2" : "order-1"}`}>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Settings
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Format</label>
            </div>
            <ToggleGroup
              type="single"
              value={exportFormat}
              onValueChange={(value) => value && setExportFormat(value)}
              className="flex gap-1 bg-sidebar/80 rounded-full ring-2 ring-secondary p-1"
            >
              {["PNG", "JPEG", "WebP"].map((format) => (
                <ToggleGroupItem
                  key={format}
                  value={format}
                  className={`flex-1 text-sm rounded-full cursor-pointer hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-primary/20 data-[state=on]:text-primary`}
                >
                  {format}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2 mt-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Quality</label>
            </div>
            <ToggleGroup
              type="single"
              value={String(quality[0])}
              onValueChange={(value) => value && setQuality([parseInt(value)])}
              className="flex gap-1 bg-sidebar/80 rounded-full ring-2 ring-secondary p-1"
            >
              <ToggleGroupItem
                value="1"
                className="flex-1 text-sm rounded-full cursor-pointer hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
              >
                Standard
              </ToggleGroupItem>
              <ToggleGroupItem
                value="2"
                className="flex-1 text-sm rounded-full cursor-pointer hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
              >
                High
              </ToggleGroupItem>
              <ToggleGroupItem
                value="3"
                className="flex-1 text-sm rounded-full cursor-pointer hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
              >
                Ultra
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <div className="space-y-3 grid grid-cols-2 gap-3 mt-12">
          <Button
            onClick={handleSingleExport}
            className="w-full h-12 font-medium shadow-md"
            variant="secondary"
            disabled={isExporting || !uploadedImage}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Export as {exportFormat}
              </>
            )}
          </Button>
          <Button
            onClick={handleAllFormatsExport}
            variant="outline"
            className="w-full h-12 font-medium"
            disabled={isExporting || !uploadedImage}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Exporting All...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Export All Formats
              </>
            )}
          </Button>
        </div>

        <Button variant="link" className="w-full">
          <a
            href="https://github.com/jellydeck/moocup"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex gap-2 w-full grid-cols-2"
          >
            <Github />
            Hey, You can also help us out at here
          </a>
        </Button>
      </div>

      <Card
        className={`rounded-xl border-2 border-dashed border-primary/20 ${!isMobile ? "order-1" : "order-2"} group`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/20 group-hover:fill-primary/50 transition-colors group-hover:animate-pulse group-hover:scale-110" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-foreground leading-relaxed">
              Hi, I'm
              <a
                href="https://jaydip.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mx-1 text-primary underline hover:no-underline"
              >
                Jaydip
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              moocup is a simple offline tool.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              focus on your craft, we'll take care of rest.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              you can show your support by sponsoring my work!
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full h-12 hover:primary/10 shadow-md">
              <a
                href="https://ko-fi.com/jaydipsanghani"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Coffee className="w-5 h-5" />
                <span className="font-medium">Buy a coffee</span>
              </a>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 border-primary/30 hover:bg-primary/5 hover:border-primary/50 inline-flex items-center"
                >
                  <span className="font-medium">UPI (India)</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xs">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Thanks so much!
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <img
                      src={upiQR}
                      className="size-full"
                      fetchPriority="auto"
                      alt="QR code for making payment in Indian Rupees"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan with any UPI app
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Say Hi!
              <span className="ml-2 text-sm text-muted-foreground leading-relaxed">
                I'm always up for quick chat :)
              </span>
            </h4>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="flex-1 border-primary/30 hover:border-primary/50"
              >
                <a
                  href="https://bsky.app/profile/jellydeck.bsky.social"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10Q2-2 2 6t5 8q-5 3-1 6t6-3q2 6 6 3t-1-6q5 0 5-8t-10 4"
                    />
                  </svg>
                  <span>Bluesky</span>
                </a>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="flex-1 border-primary/30 hover:border-primary/50"
              >
                <a
                  href="https://twitter.com/JellyDeck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="flex items-center justify-between px-4 h-16 lg:mx-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">Moo</h1>
            <a
              href="https://ko-fi.com/jaydipsanghani"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Coffee className="w-6 h-6 text-primary hover:text-primary/80 hover:rotate-12 transition-transform cursor-pointer" />
            </a>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>crafted by</span>
              <Button
                variant="link"
                className="h-auto p-0 text-primary"
                asChild
              >
                <a
                  href="https://jaydip.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 underline hover:no-underline!"
                >
                  Jaydip
                </a>
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/jellydeck/moocup"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2 mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                stroke="#000"
                viewBox="0 0 20 20"
              >
                <g id="SVGRepo_iconCarrier">
                  <g
                    id="Page-1"
                    fill="none"
                    fillRule="evenodd"
                    stroke="none"
                    strokeWidth="1"
                  >
                    <g
                      id="Dribbble-Light-Preview"
                      fill="#99d28e"
                      transform="translate(-140 -7559)"
                    >
                      <g id="icons" transform="translate(56 160)">
                        <path
                          id="github-[#99d28e142]"
                          d="M94 7399c5.523 0 10 4.59 10 10.253 0 4.529-2.862 8.371-6.833 9.728-.507.101-.687-.219-.687-.492 0-.338.012-1.442.012-2.814 0-.956-.32-1.58-.679-1.898 2.227-.254 4.567-1.121 4.567-5.059 0-1.12-.388-2.034-1.03-2.752.104-.259.447-1.302-.098-2.714 0 0-.838-.275-2.747 1.051a9.4 9.4 0 0 0-2.505-.345 9.4 9.4 0 0 0-2.503.345c-1.911-1.326-2.751-1.051-2.751-1.051-.543 1.412-.2 2.455-.097 2.714-.639.718-1.03 1.632-1.03 2.752 0 3.928 2.335 4.808 4.556 5.067-.286.256-.545.708-.635 1.371-.57.262-2.018.715-2.91-.852 0 0-.529-.985-1.533-1.057 0 0-.975-.013-.068.623 0 0 .655.315 1.11 1.5 0 0 .587 1.83 3.369 1.21.005.857.014 1.665.014 1.909 0 .271-.184.588-.683.493-3.974-1.355-6.839-5.199-6.839-9.729 0-5.663 4.478-10.253 10-10.253"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
              Send us a star!
            </Button>
          </a>
          {isMobile ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  disabled={!uploadedImage}
                  className="h-10 w-10"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md h-[90vh] max-h-[90vh] flex flex-col p-0 [&>button:first-of-type]:hidden">
                <div className="flex items-center justify-between p-4 border-b shrink-0">
                  <DialogTitle className="text-lg font-semibold">
                    Export & Support
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDialogOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 pb-4">
                    <ExportOptionsContent />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowExportOptions(!showExportOptions)}
                disabled={!uploadedImage}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showExportOptions ? "rotate-180" : ""}`}
                />
              </Button>
              {showExportOptions && (
                <Card className="absolute right-0 top-full mt-2 w-[900px] shadow-lg z-50 bg-background border rounded-2xl">
                  <CardContent className="p-6">
                    <ExportOptionsContent />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
