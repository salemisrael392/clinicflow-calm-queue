import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Activity, Stethoscope, User } from "lucide-react";

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleMode, setRoleMode] = useState<"patient" | "doctor">("patient");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupSpecialty, setSignupSpecialty] = useState("General");
  const [signupQualification, setSignupQualification] = useState("");
  const [signupExperience, setSignupExperience] = useState("");
  const [signupFee, setSignupFee] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Activity className="h-8 w-8 animate-pulse-soft text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast({ title: "Welcome back!", description: "You've been signed in." });
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp(signupEmail, signupPassword, signupName, roleMode === "doctor" ? "doctor" : "user", signupSpecialty);
      toast({ title: "Account created!", description: "You can now sign in." });
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const accentClass = roleMode === "doctor" ? "bg-secondary hover:bg-secondary/90" : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Clinic Flow</h1>
          </div>
          <p className="text-muted-foreground">Hospital Appointment Scheduling</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setRoleMode("patient")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
              roleMode === "patient"
                ? "border-primary bg-accent shadow-sm"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              roleMode === "patient" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              <User className="h-6 w-6" />
            </div>
            <span className={`text-sm font-semibold ${roleMode === "patient" ? "text-primary" : "text-muted-foreground"}`}>
              Patient
            </span>
          </button>
          <button
            onClick={() => setRoleMode("doctor")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
              roleMode === "doctor"
                ? "border-secondary bg-secondary/10 shadow-sm"
                : "border-border bg-card hover:border-secondary/40"
            }`}
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              roleMode === "doctor" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className={`text-sm font-semibold ${roleMode === "doctor" ? "text-secondary" : "text-muted-foreground"}`}>
              Doctor
            </span>
          </button>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              {roleMode === "patient" ? "Patient Portal" : "Doctor Portal"}
            </CardTitle>
            <CardDescription>
              {roleMode === "patient"
                ? "Sign in to book appointments and track your queue"
                : "Sign in to manage your schedule and patient queues"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className={`w-full ${accentClass}`} disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : `Sign In as ${roleMode === "patient" ? "Patient" : "Doctor"}`}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" placeholder={roleMode === "doctor" ? "Dr. Jane Smith" : "John Doe"} value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                  </div>
                  {roleMode === "doctor" && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-specialty">Specialty</Label>
                      <Select value={signupSpecialty} onValueChange={setSignupSpecialty}>
                        <SelectTrigger id="signup-specialty">
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General Medicine</SelectItem>
                          <SelectItem value="Cardiology">Cardiology</SelectItem>
                          <SelectItem value="Dermatology">Dermatology</SelectItem>
                          <SelectItem value="Neurology">Neurology</SelectItem>
                          <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                          <SelectItem value="ENT">ENT</SelectItem>
                          <SelectItem value="Gynecology">Gynecology</SelectItem>
                          <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="Dentistry">Dentistry</SelectItem>
                    </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-qualification">Qualification</Label>
                      <Input id="signup-qualification" placeholder="MBBS, MD, etc." value={signupQualification} onChange={(e) => setSignupQualification(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-experience">Years of Experience</Label>
                        <Input id="signup-experience" type="number" min="0" placeholder="5" value={signupExperience} onChange={(e) => setSignupExperience(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-fee">Consultation Fee (₹)</Label>
                        <Input id="signup-fee" type="number" min="0" placeholder="500" value={signupFee} onChange={(e) => setSignupFee(e.target.value)} />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className={`w-full ${accentClass}`} disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : `Create ${roleMode === "patient" ? "Patient" : "Doctor"} Account`}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
