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
import { Activity, ArrowRight, ShieldCheck, Stethoscope, User } from "lucide-react";
import clinicLobby from "@/assets/clinic-lobby.jpg";

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
      await signUp(
        signupEmail, signupPassword, signupName,
        roleMode === "doctor" ? "doctor" : "user",
        signupSpecialty,
        signupQualification || undefined,
        signupExperience ? parseInt(signupExperience) : undefined,
        signupFee ? parseFloat(signupFee) : undefined
      );
      toast({ title: "Account created!", description: "You can now sign in." });
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const accentClass = roleMode === "doctor" ? "bg-secondary hover:bg-secondary/90" : "";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.08fr_0.92fr] bg-background">
      <section className="relative min-h-[32vh] lg:min-h-screen overflow-hidden">
        <img src={clinicLobby} alt="Bright Clinic Flow hospital lobby" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-deep/15 to-transparent" />
        <div className="relative z-10 flex h-full min-h-[32vh] lg:min-h-screen flex-col justify-between p-6 sm:p-10 lg:p-14 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-background/90 text-primary shadow-lg backdrop-blur">
              <Activity className="h-6 w-6" />
            </div>
            <span className="font-display text-3xl">Clinic Flow</span>
          </div>
          <div className="max-w-xl pb-2 lg:pb-8">
            <p className="mb-4 text-sm font-semibold uppercase text-primary-foreground/80">Care, without the waiting-room uncertainty</p>
            <h1 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">Your care journey, clearly arranged.</h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/85">Book trusted doctors, receive your token, and follow the queue from wherever you are.</p>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[68vh] items-center justify-center overflow-y-auto p-4 sm:p-8 lg:p-12">
        <div className="absolute inset-0 bg-accent/35" />
        <div className="relative z-10 w-full max-w-lg py-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-primary">Choose your portal</p>
            <h2 className="mt-1 text-4xl text-foreground">Welcome to Clinic Flow</h2>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-card/55 p-1.5 backdrop-blur-md">
            <Button type="button" variant="ghost" onClick={() => setRoleMode("patient")} className={`h-16 flex-col gap-1 ${roleMode === "patient" ? "bg-card text-primary shadow-sm hover:bg-card" : "text-muted-foreground"}`}>
              <User className="h-5 w-5" /><span>Patient</span>
            </Button>
            <Button type="button" variant="ghost" onClick={() => setRoleMode("doctor")} className={`h-16 flex-col gap-1 ${roleMode === "doctor" ? "bg-card text-secondary shadow-sm hover:bg-card" : "text-muted-foreground"}`}>
              <Stethoscope className="h-5 w-5" /><span>Doctor</span>
            </Button>
          </div>

          <Card className="glass-panel border-background/70">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl">
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
                  <Button type="submit" size="lg" className={`w-full ${accentClass}`} disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : `Sign In as ${roleMode === "patient" ? "Patient" : "Doctor"}`}
                    {!isSubmitting && <ArrowRight className="h-4 w-4" />}
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
                    <>
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
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" size="lg" className={`w-full ${accentClass}`} disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : `Create ${roleMode === "patient" ? "Patient" : "Doctor"} Account`}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-border/60 pt-5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-secondary" /> Secure access to your care journey
            </div>
          </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
