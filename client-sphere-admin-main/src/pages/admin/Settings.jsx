import { useState, useEffect, useRef } from "react";
import {
  User,
  Shield,
  Palette,
  CreditCard,
  Plug,
  Globe,
  Trash2,
  Check,
  KeyRound,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useUICustomization } from "@/contexts/UICustomizationContext";
import { colorPresets } from "@/contexts/UICustomizationContext";
import { navColorPresets } from "@/contexts/UICustomizationContext";
import { fontPresets } from "@/contexts/UICustomizationContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import {
  adminProfileService,
  fetchAdminProfile,
  saveAdminProfile,
} from "@/services/adminProfileService";
// import { adminSettingsService } from "@/services/adminSettingsService";
import { getSessionUser } from "@/utils/authSession";
import { compressImageFile } from "@/utils/compressImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ================= MAIN ================= */
export default function SettingsPage() {
 const sidebarItem =
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full justify-start " +
  "hover:bg-gray-100 " +
  "data-[state=active]:bg-primary data-[state=active]:text-white";

  return (
    <div className="space-y-6 mt-14">

      <Tabs defaultValue="profile" className="flex items-start">

  {/* 🔥 LEFT SIDEBAR */}
  <div className="w-[240px] pr-8 sticky  top-18 pt-20 h-fit">

    <TabsList className="flex flex-col gap-2 bg-transparent p-0">

      <TabsTrigger value="profile" className={sidebarItem}>
        <User className="h-4 w-4" /> Profile
      </TabsTrigger>

      {/* <TabsTrigger value="workspace" className={sidebarItem}>
        <Globe className="h-4 w-4" /> Workspace
      </TabsTrigger> */}

      <TabsTrigger value="security" className={sidebarItem}>
        <Shield className="h-4 w-4" /> Security
      </TabsTrigger>

      <TabsTrigger value="appearance" className={sidebarItem}>
        <Palette className="h-4 w-4" /> Appearance
      </TabsTrigger>

      {/* <TabsTrigger value="integrations" className={sidebarItem}>
        <Plug className="h-4 w-4" /> Integrations
      </TabsTrigger> */}

    </TabsList>

  </div>

  {/* 🔥 MIDDLE VERTICAL LINE */}
  <div className="w-px bg-gray-200 mx-4"></div>

  {/* 🔥 RIGHT CONTENT */}
  <div className="flex-1 pl-2">

    <p className="text-lg font-semibold ">
      Manage your workspace, profile and platform preferences.
    </p>

    <TabsContent value="profile"><ProfileSection /></TabsContent>
    {/* <TabsContent value="workspace"><WorkspaceSection /></TabsContent> */}
    <TabsContent value="security"><SecuritySection /></TabsContent>
    <TabsContent value="appearance"><AppearanceSection /></TabsContent>
    {/* <TabsContent value="integrations"><IntegrationsSection /></TabsContent> */}

  </div>

</Tabs>
    </div>
  );
}

/* ================= COMMON CARD ================= */
function SectionCard({ title, description, children, footer }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-5">
        {children}
      </CardContent>

      {footer && (
        <div className="flex justify-end gap-2 border-t bg-muted/30 px-6 py-3">
          {footer}
        </div>
      )}
    </Card>
  );
}

/* ================= PROFILE ================= */
function ProfileSection() {
  const session = getSessionUser();
  const fileRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadError("");
      try {
        const profile = await fetchAdminProfile();
        if (cancelled) return;
        setName(profile.name || "");
        setEmail(profile.email || "");
        setBio(profile.bio || "");
        setImage(profile.avatar || null);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err.response?.data?.message || "Could not load profile from database"
          );
          setName(session?.name || "");
          setEmail(session?.email || "");
          setBio("");
          setImage(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    try {
      const compressed = await compressImageFile(file);
      setImage(compressed);
    } catch {
      toast.error("Could not process image");
    }
  };

  const handleRemove = () => {
    setImage(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      const profile = await saveAdminProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        bio: bio.trim(),
        avatar: image,
      });
      setName(profile.name || "");
      setEmail(profile.email || "");
      setBio(profile.bio || "");
      setImage(profile.avatar || null);
      toast.success("Profile saved to database");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SectionCard title="Profile information" description="Loading...">
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Profile"
      description="Same as student profile: name, email, photo and bio saved to the database."
      footer={
        <>
          {loadError && (
            <p className="text-sm text-destructive mr-auto">{loadError}</p>
          )}
          <Button
            variant="outline"
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                const profile = await fetchAdminProfile();
                setName(profile.name || "");
                setEmail(profile.email || "");
                setBio(profile.bio || "");
                setImage(profile.avatar || null);
                setLoadError("");
              } catch (err) {
                toast.error(err.response?.data?.message || "Reload failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="h-16 w-16">
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
            {(name || "A")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              Change Photo
            </Button>
            {image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">JPG, PNG. Max 2MB</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Bio</Label>
        <Textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us a little about yourself"
        />
      </div>
    </SectionCard>
  );
}

/* ================= WORKSPACE ================= */
// function WorkspaceSection() {
//   const [workspaceName, setWorkspaceName] = useState("LearnHub");
//   const [publicUrl, setPublicUrl] = useState("learnhub.app");
//   const [defaultLanguage, setDefaultLanguage] = useState("en");
//   const [timezone, setTimezone] = useState("utc");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [loadError, setLoadError] = useState("");

//   const applyWorkspace = (ws) => {
//     setWorkspaceName(ws.workspaceName || "LearnHub");
//     setPublicUrl(ws.publicUrl || "");
//     setDefaultLanguage(ws.defaultLanguage || "en");
//     setTimezone(ws.timezone || "utc");
//   };

//   const loadWorkspace = async () => {
//     setLoading(true);
//     setLoadError("");
//     try {
//       const res = await adminSettingsService.getWorkspace();
//       applyWorkspace(res.data.workspace || {});
//     } catch (err) {
//       setLoadError(
//         err.response?.data?.message || "Could not load workspace settings"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadWorkspace();
//   }, []);

//   const handleSave = async () => {
//     if (!workspaceName.trim()) {
//       toast.error("Workspace name is required");
//       return;
//     }

//     setSaving(true);
//     try {
//       const res = await adminSettingsService.saveWorkspace({
//         workspaceName: workspaceName.trim(),
//         publicUrl: publicUrl.trim(),
//         defaultLanguage,
//         timezone,
//       });
//       applyWorkspace(res.data.workspace || {});
//       toast.success("Workspace saved");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Could not save workspace");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SectionCard title="Workspace" description="Loading workspace settings...">
//         <p className="text-sm text-muted-foreground">Loading...</p>
//       </SectionCard>
//     );
//   }

//   return (
//     <SectionCard
//       title="Workspace"
//       description="Brand and defaults applied across your platform."
//       footer={
//         <>
//           {loadError && (
//             <p className="text-sm text-destructive mr-auto">{loadError}</p>
//           )}
//           <Button variant="outline" type="button" onClick={loadWorkspace} disabled={saving}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave} disabled={saving}>
//             {saving ? "Saving..." : "Save changes"}
//           </Button>
//         </>
//       }
//     >
//       <div className="grid gap-4 sm:grid-cols-2">

//         <div className="grid gap-2">
//           <Label htmlFor="ws-name">Workspace name</Label>
//           <Input
//             id="ws-name"
//             value={workspaceName}
//             onChange={(e) => setWorkspaceName(e.target.value)}
//           />
//         </div>

//         <div className="grid gap-2">
//           <Label htmlFor="ws-domain">Public URL</Label>
//           <Input
//             id="ws-domain"
//             value={publicUrl}
//             onChange={(e) => setPublicUrl(e.target.value)}
//           />
//         </div>

//         <div className="grid gap-2">
//           <Label>Default language</Label>
//           <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
//             <SelectTrigger>
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="en">English</SelectItem>
//               <SelectItem value="es">Spanish</SelectItem>
//               <SelectItem value="fr">French</SelectItem>
//               <SelectItem value="de">German</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="grid gap-2">
//           <Label>Timezone</Label>
//           <Select value={timezone} onValueChange={setTimezone}>
//             <SelectTrigger>
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="utc">UTC</SelectItem>
//               <SelectItem value="pst">Pacific (PST)</SelectItem>
//               <SelectItem value="est">Eastern (EST)</SelectItem>
//               <SelectItem value="ist">India (IST)</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//       </div>
//     </SectionCard>
//   );
// }

/* ================= SECURITY ================= */
function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await adminProfileService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* PASSWORD */}
      <SectionCard
        title="Password"
        description="Use a strong, unique password to protect your account."
        footer={
          <Button onClick={handlePasswordUpdate} disabled={saving}>
            {saving ? "Updating..." : "Update password"}
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">

          <div className="grid gap-2 sm:col-span-2">
            <Label>Current password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>New password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Confirm new password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

        </div>
      </SectionCard>

      {/* TWO FACTOR */}
      <SectionCard
        title="Two-factor authentication"
        description="Add a second layer of security with an authenticator app."
      >
        <div className="flex items-center justify-between">

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <KeyRound className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-medium">Authenticator app</p>
              <p className="text-xs text-muted-foreground">
                Use Google Authenticator, 1Password or Authy.
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="gap-1">
            <Check className="h-3 w-3" /> Enabled
          </Badge>

        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Active sessions</p>
            <p className="text-xs text-muted-foreground">
              2 devices currently signed in.
            </p>
          </div>

          <Button variant="outline" size="sm">
            Manage
          </Button>
        </div>
      </SectionCard>

      {/* DANGER ZONE */}
      <SectionCard
        title="Danger zone"
        description="Irreversible and destructive actions."
      >
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium">Delete workspace</p>
            <p className="text-xs text-muted-foreground">
              Permanently remove the workspace and all data.
            </p>
          </div>

          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" /> Delete workspace
          </Button>

        </div>
      </SectionCard>

    </div>
  );
}

/* ================= APPEARANCE ================= */
function AppearanceSection() {
  
  const { isDark, toggle } = useTheme();
    const {
      colorPreset,
      fontPreset,
      borderRadius,
      navColorPreset,
      setColorPreset,
      setFontPreset,
      setBorderRadius,
      setNavColorPreset,
    } = useUICustomization();


  const borderRadiusPresets = [
    { id: "sm", name: "Small", value: "6px" },
    { id: "md", name: "Medium", value: "12px" },
    { id: "lg", name: "Large", value: "20px" },
  ];

  return (
    <div className="space-y-8">

  {/* THEME MODE */}
  <div>
    <h3 className="text-sm font-semibold text-foreground mb-3">
      Theme Mode
    </h3>

    <div className="flex gap-3">
      {[
        { label: "Light", active: !isDark },
        { label: "Dark", active: isDark },
      ].map((mode) => (
        <button
          key={mode.label}
          onClick={() => {
            if (mode.active) return;
            toggle();
          }}
          className={`flex-1 max-w-[160px] h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition ${
            mode.active
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-secondary text-muted-foreground hover:border-primary/40"
          }`}
        >
          <div
            className={`w-8 h-5 rounded-md ${
              mode.label === "Light"
                ? "bg-white border border-border shadow-sm"
                : "bg-foreground"
            }`}
          />
          <span className="text-xs font-medium">{mode.label}</span>
        </button>
      ))}
    </div>
  </div>

  {/* COLOR PALETTE */}
  <div>
    <h3 className="text-sm font-semibold text-foreground mb-1">
      Color Palette
    </h3>

    <p className="text-xs text-muted-foreground mb-3">
      Choose a primary accent color
    </p>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {colorPresets.map((preset) => {
        const isActive = colorPreset === preset.id;

        return (
          <button
            key={preset.id}
            onClick={() => setColorPreset(preset.id)}
            className={`relative rounded-xl border-2 p-3 transition ${
              isActive
                ? "border-primary shadow-md"
                : "border-border hover:border-primary/40"
            }`}
          >
            {isActive && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            <div className="flex gap-1 mb-2">
              {preset.preview.map((color, i) => (
                <div
                  key={i}
                  className="flex-1 h-6 rounded-md"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <span className="text-xs font-medium text-foreground">
              {preset.name}
            </span>
          </button>
        );
      })}
    </div>
  </div>

  {/* TYPOGRAPHY */}
  <div>
    <h3 className="text-sm font-semibold text-foreground mb-1">
      Typography
    </h3>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {fontPresets.map((preset) => {
        const isActive = fontPreset === preset.id;

        return (
          <button
            key={preset.id}
            onClick={() => setFontPreset(preset.id)}
            className={`relative rounded-xl border-2 p-4 text-left transition ${
              isActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            {isActive && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            <span
              className="block font-bold mb-1"
              style={{ fontFamily: `${preset.heading}, sans-serif` }}
            >
              {preset.heading}
            </span>

            <span className="text-xs text-muted-foreground">
              Body: {preset.body}
            </span>
          </button>
        );
      })}
    </div>
  </div>

  {/* BORDER RADIUS */}
  <div>
    <h3 className="text-sm font-semibold text-foreground mb-1">
      Border Radius
    </h3>

    <div className="flex gap-3 flex-wrap">
      {borderRadiusPresets.map((preset) => {
        const isActive = borderRadius === preset.id;

        return (
          <button
            key={preset.id}
            onClick={() => setBorderRadius(preset.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 ${
              isActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div
              className="w-10 h-10 bg-primary/20 border"
              style={{ borderRadius: preset.value }}
            />
            <span className="text-xs">{preset.name}</span>
          </button>
        );
      })}
    </div>
  </div>

  {/* NAVIGATION BG */}
  <div>
    <h3 className="text-sm font-semibold text-foreground mb-1">
      Navigation Background
    </h3>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {navColorPresets.map((preset) => {
        const isActive = navColorPreset === preset.id;

        return (
          <button
            key={preset.id}
            onClick={() => setNavColorPreset(preset.id)}
            className={`relative rounded-xl border-2 p-3 ${
              isActive
                ? "border-primary shadow-md"
                : "border-border hover:border-primary/40"
            }`}
          >
            {isActive && (
              <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
            )}

            <div
              className="w-full h-10 rounded-lg mb-2"
              style={{ backgroundColor: preset.preview }}
            />

            <span className="text-xs">{preset.name}</span>
          </button>
        );
      })}
    </div>
  </div>

</div>
  );
}

/* ================= BILLING ================= */
// function BillingSection() {
//   return (
//     <SectionCard title="Billing">
//       <Button onClick={() => toast.success("Billing saved")}>
//         Save
//       </Button>
//     </SectionCard>
//   );
// }

/* ================= INTEGRATIONS ================= */
// const INTEGRATION_META = [
//   {
//     provider: "slack",
//     name: "Slack",
//     desc: "Get course updates in your channels.",
//     color: "from-violet-500 to-fuchsia-500",
//   },
//   {
//     provider: "zoom",
//     name: "Zoom",
//     desc: "Schedule live classes inside courses.",
//     color: "from-sky-500 to-cyan-400",
//   },
//   {
//     provider: "stripe",
//     name: "Stripe",
//     desc: "Accept payments for paid courses.",
//     color: "from-indigo-500 to-blue-500",
//   },
//   {
//     provider: "google_drive",
//     name: "Google Drive",
//     desc: "Import learning materials directly.",
//     color: "from-emerald-500 to-teal-400",
//   },
//   {
//     provider: "mailchimp",
//     name: "Mailchimp",
//     desc: "Sync students into marketing audiences.",
//     color: "from-amber-500 to-orange-400",
//   },
//   {
//     provider: "webhooks",
//     name: "Webhooks",
//     desc: "Send platform events to your endpoints.",
//     color: "from-pink-500 to-rose-400",
//   },
// ];

// function IntegrationsSection() {
//   const [connectedMap, setConnectedMap] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [toggling, setToggling] = useState(null);

//   const loadIntegrations = async () => {
//     setLoading(true);
//     try {
//       const res = await adminSettingsService.getIntegrations();
//       const map = {};
//       (res.data.integrations || []).forEach((item) => {
//         map[item.provider] = !!item.connected;
//       });
//       setConnectedMap(map);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Could not load integrations");
//       setConnectedMap({});
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadIntegrations();
//   }, []);

//   const handleToggle = async (provider, name, currentlyConnected) => {
//     setToggling(provider);
//     try {
//       const res = await adminSettingsService.toggleIntegration(
//         provider,
//         !currentlyConnected
//       );
//       setConnectedMap((prev) => ({
//         ...prev,
//         [provider]: !!res.data.integration?.connected,
//       }));
//       toast.success(
//         res.data.integration?.connected
//           ? `${name} connected`
//           : `${name} disconnected`
//       );
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Could not update integration");
//     } finally {
//       setToggling(null);
//     }
//   };

//   if (loading) {
//     return (
//       <p className="text-sm text-muted-foreground py-4">Loading integrations...</p>
//     );
//   }

//   return (
//     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//       {INTEGRATION_META.map((i) => {
//         const connected = !!connectedMap[i.provider];
//         return (
//           <Card key={i.name} className="transition-all hover:shadow-md">
//             <CardContent className="p-5">
//               <div className="flex items-start justify-between">
//                 <div
//                   className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${i.color} text-white shadow-sm`}
//                 >
//                   <Plug className="h-5 w-5" />
//                 </div>

//                 {connected ? (
//                   <Badge variant="secondary" className="gap-1">
//                     <Check className="h-3 w-3" /> Connected
//                   </Badge>
//                 ) : (
//                   <Badge variant="outline">Not connected</Badge>
//                 )}
//               </div>

//               <p className="mt-4 font-medium">{i.name}</p>

//               <p className="mt-1 text-xs text-muted-foreground">
//                 {i.desc}
//               </p>

//               <div className="mt-4">
//                 <Button
//                   variant={connected ? "outline" : "default"}
//                   size="sm"
//                   className="w-full"
//                   disabled={toggling === i.provider}
//                   onClick={() => handleToggle(i.provider, i.name, connected)}
//                 >
//                   {toggling === i.provider
//                     ? "Please wait..."
//                     : connected
//                       ? "Disconnect"
//                       : "Connect"}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   );
// }

