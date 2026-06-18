import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  User, Palette, LogOut, Trash2,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

import { catalog } from "../../lib/catalog";
import { CourseCard } from "./CourseCard";
// import {
//   getCart,
//   isLearnerLoggedIn,
//   resolveWishlistCourses,
//   WISHLIST_CHANGED_EVENT,
// } from "../../utils/userStore";
import { isLearnerLoggedIn } from "../../utils/userStore";

import { mapPublicCourseForCard } from "@/utils/mapPublicCourse";

import MyLearning from "./MyLearning";
import { PageWithFooter } from "@/components/layout/PageWithFooter";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";
import {
  fetchUserProfile,
  saveUserProfile,
} from "@/services/userProfileService";
import { getSessionUser, clearAuthSession } from "@/utils/authSession";
import { compressImageFile } from "@/utils/compressImage";

// const emptyProfileForm = () => ({
//   name: "",
//   email: "",
//   bio: "",
//   avatar: null,
//   cart: getCart(),
// });
const emptyProfileForm = () => ({
  name: "",
  email: "",
  bio: "",
  avatar: null,
  school: "",
  classLevel: "",
});

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(emptyProfileForm);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setProfileLoadError("");
      try {
        const profile = await fetchUserProfile();
        if (cancelled) return;
        setUser((prev) => ({
          ...prev,
          name: profile.name || "",
          email: profile.email || "",
          bio: profile.bio || "",
          avatar: profile.avatar || null,
          school: profile.school || "",
          classLevel: profile.classLevel || "",
        }));
      } catch (err) {
        if (cancelled) return;
        const session = getSessionUser();
        setProfileLoadError(
          err.response?.data?.message || "Could not load profile from database"
        );
        setUser((prev) => ({
          ...prev,
          name: session?.name || "",
          email: session?.email || "",
          bio: "",
          avatar: null,
        }));
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const [theme, setTheme] = useState("light");

  useEffect(() => {
  const root = window.document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}, [theme]);

  const fileRef = useRef(null);

  // const cartIds = getCart();
  // const cartItems = catalog.filter((c) => cartIds.includes(String(c.id)));

  const location = useLocation();

  const getTabFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "profile";
  };

  const [activeTab, setActiveTab] = useState(getTabFromURL());

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let tab = params.get("tab") || "profile";
    if (tab === "notifications" || tab === "security") {
      tab = "profile";
      navigate("/settings?tab=profile", { replace: true });
    }
    setActiveTab(tab);
  }, [location.search, navigate]);

const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const compressed = await compressImageFile(file, 200, 0.7);
    setUser({ ...user, avatar: compressed });
  } catch {
    toast.error("Could not process image");
  }
};

  return (
    <PageWithFooter variant="user">
    <div className="mx-auto max-w-7xl px-4 py-4 space-y-4 sm:space-y-6 sm:px-6">
      <Tabs
        value={activeTab}
        onValueChange={(tab) => {
          setActiveTab(tab);
          navigate(`/settings?tab=${tab}`);
        }}
        className="w-full"
      >
        <div className="border-b overflow-x-auto">
          <TabsList className="flex h-auto w-max min-w-full justify-start gap-1 bg-transparent p-0 rounded-none">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "learning", label: "My Learning", icon: User },
              { id: "appearance", label: "Appearance", icon: Palette },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent rounded-none bg-transparent shadow-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
         <TabsContent value="profile" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Loaded from database. Save stores changes in MySQL only (not localStorage).
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {profileLoading ? (
                <p className="text-sm text-muted-foreground">Loading profile...</p>
              ) : (
              <>
              {profileLoadError && (
                <p className="text-sm text-destructive">{profileLoadError}</p>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-16 w-16">
                  {user.avatar && <AvatarImage src={user.avatar} />}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                    {(user.name || "U").split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />

                  <div className="flex gap-2">
                    <Button onClick={() => fileRef.current?.click()}>
                      Change Photo
                    </Button>

                    
                    {user.avatar && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const updatedUser = { ...user, avatar: null };
                          setUser(updatedUser);
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG. Max 2MB
                  </p>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label>School</Label>
                  <Input value={user.school || "—"} readOnly disabled />
                </div>

                <div>
                  <Label>Class</Label>
                  <Input value={user.classLevel || "—"} readOnly disabled />
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  rows={3}
                  value={user.bio || ""}
                  onChange={(e) => setUser({ ...user, bio: e.target.value })}
                  placeholder="Tell us a little about yourself"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  disabled={profileSaving}
                  onClick={async () => {
                    if (!user.name?.trim() || !user.email?.trim()) {
                      toast.error("Name and email are required");
                      return;
                    }
                    setProfileSaving(true);
                    try {
                      const profile = await saveUserProfile({
                        name: user.name.trim(),
                        email: user.email.trim().toLowerCase(),
                        bio: user.bio?.trim() || "",
                        avatar: user.avatar,
                      });
                      setUser((prev) => ({ ...prev, ...profile }));
                      toast.success("Profile saved to database");
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message || "Could not save profile"
                      );
                    } finally {
                      setProfileSaving(false);
                    }
                  }}
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Sign out from this device</p>
                  <p className="text-xs text-muted-foreground">
                    You sign in with Google. Sign out to switch accounts.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearAuthSession();
                    navigate("/", { replace: true });
                  }}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
              </>
              )}

            </CardContent>
          </Card>
         </TabsContent>

    <TabsContent value="appearance" className="mt-0">
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle>Appearance</CardTitle>
      <CardDescription>Pick how LearnHub looks to you.</CardDescription>
    </CardHeader>

    <CardContent>
      <div className="grid gap-3 sm:grid-cols-2">
        {["light", "dark"].map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`rounded-xl border p-4 text-left transition ${
              theme === t
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:bg-accent/40"
            }`}
          >
            <div
              className={`h-20 rounded-lg ${
                t === "light"
                  ? "bg-gradient-to-br from-white to-slate-100 border"
                  : "bg-gradient-to-br from-slate-800 to-slate-950"
              }`}
            />

            <p className="mt-3 text-sm font-medium capitalize">{t}</p>

            <p className="text-xs text-muted-foreground">
              {t === "light"
                ? "Bright and clean"
                : "Easy on the eyes"}
            </p>
          </button>
        ))}
      </div>
    </CardContent>
  </Card>
    </TabsContent>

      <TabsContent value="learning" className="mt-0">
        <MyLearning embedded />
      </TabsContent>
        </div>
      </Tabs>
    </div>
    </PageWithFooter>
  );
}


