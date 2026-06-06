import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Shield, User, Palette, LogOut,
  Heart, ShoppingCart, Trash2, X
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
// import { syncWishlistFromServer } from "@/services/wishlistService";
import { wishlistService } from "@/services/wishlistService";

// import { getLearningProgress } from "../../utils/userStore";
import MyLearning from "./MyLearning";
import { PageWithFooter } from "@/components/layout/PageWithFooter";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";
import {
  userProfileService,
  fetchUserProfile,
  saveUserProfile,
} from "@/services/userProfileService";
import { getSessionUser } from "@/utils/authSession";
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
});

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(emptyProfileForm);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

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

  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let tab = params.get("tab") || "profile";
    if (tab === "notifications") {
      tab = "profile";
      navigate("/settings?tab=profile", { replace: true });
    }
    setActiveTab(tab);
  }, [location.search, navigate]);

  // const loadWishlist = async () => {
  //   setWishlistLoading(true);
  //   try {
  //     if (isLearnerLoggedIn()) {
  //       const { courses } = await syncWishlistFromServer();
  //       setWishlistCourses(courses.map(mapPublicCourseForCard));
  //     } else {
  //       setWishlistCourses(resolveWishlistCourses());
  //     }
  //   } catch {
  //     setWishlistCourses(resolveWishlistCourses());
  //   } finally {
  //     setWishlistLoading(false);
  //   }
  // };
  const loadWishlist = async () => {
  setWishlistLoading(true);

  try {
    if (!isLearnerLoggedIn()) {
      setWishlistCourses([]);
      return;
    }

    const res = await wishlistService.getAll();
    setWishlistCourses((res.data.courses || []).map(mapPublicCourseForCard));
  } catch {
    setWishlistCourses([]);
  } finally {
    setWishlistLoading(false);
  }
};

  useEffect(() => {
    if (activeTab !== "wishlist") return;
    loadWishlist();
  }, [activeTab]);

  

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
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full py-4">

      <div className="w-full lg:w-[240px] space-y-2 flex lg:block overflow-x-auto lg:overflow-visible">
  {[
    { id: "profile", label: "Profile", icon: User },
    { id: "learning", label: "My Learning", icon: User },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    // { id: "cart", label: "Cart", icon: ShoppingCart },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ].map((item) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        // onClick={() => setActiveTab(item.id)}
        onClick={() => {
          setActiveTab(item.id);
          navigate(`/settings?tab=${item.id}`);
        }}
        className={`min-w-[140px] lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap
          ${activeTab === item.id
            ? "bg-primary text-white"
            : "hover:bg-muted"
          }`}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </button>
    );
  })}
</div>   {/* ✅ CLOSE SIDEBAR HERE */}

      <div className="flex-1 space-y-4 sm:space-y-6">

         {activeTab === "profile" && (
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
                    {user.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
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
              </>
              )}

            </CardContent>
          </Card>
    )}

    {activeTab === "wishlist" && (
      // <TabsContent value="wishlist">
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-primary" /> My wishlist
      </CardTitle>
      <CardDescription>Courses you've saved for later.</CardDescription>
    </CardHeader>

    <CardContent>
      {wishlistLoading ? (
        <p className="text-sm text-muted-foreground">Loading wishlist...</p>
      ) : wishlistCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Wishlist is empty</p>

          <Button asChild className="mt-4">
            <Link to="/courses">Browse courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onWishlistChange={() => loadWishlist()}
            />
          ))}
        </div>
      )}
    </CardContent>
  </Card>
// </TabsContent>
    )}

    

    {activeTab === "appearance" && (
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
// </TabsContent>

    )}

    {activeTab === "security" && (
      // <TabsContent value="security">
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle>Security</CardTitle>
      <CardDescription>Keep your account safe.</CardDescription>
    </CardHeader>

    <CardContent className="space-y-5">
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Current password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>New password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Confirm password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          disabled={passwordSaving}
          onClick={async () => {
            if (!currentPassword || !newPassword || !confirmPassword) {
              toast.error("Fill all password fields");
              return;
            }
            if (newPassword !== confirmPassword) {
              toast.error("Passwords do not match");
              return;
            }
            setPasswordSaving(true);
            try {
              await userProfileService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
              });
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              toast.success("Password updated");
            } catch (err) {
              toast.error(
                err.response?.data?.message || "Could not update password"
              );
            } finally {
              setPasswordSaving(false);
            }
          }}
        >
          {passwordSaving ? "Updating..." : "Update password"}
        </Button>
      </div>

      <Separator />

      {/* Logout Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            Sign out from this device
          </p>
          <p className="text-xs text-muted-foreground">
            You'll need to sign in again next time.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate("/login")}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

    </CardContent>
  </Card>
// </TabsContent>
    )}

    {/*  my learning page */}

      {activeTab === "learning" && (
        <MyLearning/>
      )}
      </div>
    </div>
    </PageWithFooter>
  );
}


