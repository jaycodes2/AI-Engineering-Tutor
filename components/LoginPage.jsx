import React, { useState } from 'react';
import { BrainCircuitIcon } from './icons.jsx';
import { Button } from './ui/Button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card.jsx';
import { Input } from './ui/Input.jsx';
import { Label } from './ui/Label.jsx';
import { 
    loginWithEmail, 
    signUpWithEmail, 
    loginWithGoogle, 
    loginWithApple 
} from '../services/auth.js';

const LoginPage = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (isSignup) {
            if (!name.trim()) {
                setError('Please enter your full name.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        }

        try {
            setIsLoading(true);
            if (isSignup) {
                const user = await signUpWithEmail(name.trim(), email.trim(), password);
                onLogin(user.displayName || name.trim(), user.email);
            } else {
                const user = await loginWithEmail(email.trim(), password);
                onLogin(user.displayName || name || user.email.split('@')[0], user.email);
            }
        } catch (err) {
            const message = err?.message || 'Authentication failed. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = async () => {
        try {
            setError('');
            setIsLoading(true);
            const user = await loginWithGoogle();
            onLogin(user.displayName || user.email.split('@')[0], user.email);
        } catch (err) {
            setError(err?.message || 'Google sign-in failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApple = async () => {
        try {
            setError('');
            setIsLoading(true);
            const user = await loginWithApple();
            onLogin(user.displayName || user.email?.split('@')[0] || 'Apple User', user.email || '');
        } catch (err) {
            setError(err?.message || 'Apple sign-in failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-6 p-4 md:p-10 font-sans animate-slide-up-fade">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex items-center gap-2 self-center font-bold text-lg text-foreground">
                    <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
                        <BrainCircuitIcon className="w-5 h-5" />
                    </div>
                    AI Engineering Tutor
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Welcome back</CardTitle>
                        <CardDescription>
                            Login with a social account or your email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="flex flex-col gap-3">
                                    <Button variant="outline" className="w-full" type="button" onClick={handleApple} disabled={isLoading}>
                                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor" />
                                        </svg>
                                        Continue with Apple
                                    </Button>
                                    <Button type="button" onClick={handleGoogle} variant="outline" className="w-full" disabled={isLoading}>
                                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                                        </svg>
                                        Continue with Google
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-grow border-t border-border" />
                                    <span className="flex-shrink-0 text-xs uppercase text-muted-foreground">
                                        Or continue with
                                    </span>
                                    <div className="flex-grow border-t border-border" />
                                </div>
                                <div className="grid gap-3">
                                    {isSignup && (
                                        <>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="Ada Lovelace"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                aria-label="Full Name"
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        aria-label="Email Address"
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        aria-label="Password"
                                    />
                                </div>
                                {isSignup && (
                                    <div className="grid gap-3">
                                        <Label htmlFor="confirm">Confirm Password</Label>
                                        <Input
                                            id="confirm"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            aria-label="Confirm Password"
                                        />
                                    </div>
                                )}
                                {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isSignup ? 'Create account' : 'Login with Email'}
                                </Button>
                                <div className="mt-2 text-center text-sm">
                                    {isSignup ? (
                                        <>
                                            Already have an account?{' '}
                                            <button type="button" onClick={() => { setIsSignup(false); setError(''); }} className="underline underline-offset-4 hover:text-primary">
                                                Log in
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Don&apos;t have an account?{' '}
                                            <button type="button" onClick={() => { setIsSignup(true); setError(''); }} className="underline underline-offset-4 hover:text-primary">
                                                Sign up
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <div className="text-muted-foreground text-center text-xs text-balance">
                    By clicking continue, you agree to our <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
                    and <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
};

export default LoginPage;