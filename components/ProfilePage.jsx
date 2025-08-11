import React, { useState } from 'react';
import { 
    UserCircleIcon,
    AstronautIcon,
    GearIcon,
    BookIcon,
    SimpleLightBulbIcon,
    TargetIcon,
    FlameIcon,
    CheckCircleIcon
} from './icons.jsx';

const Avatar = ({ icon: Icon, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
        ${isSelected
            ? 'bg-blue-500/20 text-blue-500 ring-2 ring-blue-500'
            : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        aria-pressed={isSelected}
    >
        <Icon className="w-8 h-8" />
    </button>
);

const avatars = [
    { id: 'UserCircle', icon: UserCircleIcon },
    { id: 'Astronaut', icon: AstronautIcon },
    { id: 'Gear', icon: GearIcon },
    { id: 'Book', icon: BookIcon },
    { id: 'LightBulb', icon: SimpleLightBulbIcon },
];

const ProfilePage = ({ user, onUpdateUser }) => {
    const [name, setName] = useState(user.name);
    const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || 'UserCircle');
    const [learningGoal, setLearningGoal] = useState(user.learningGoal || 3);
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateUser({
            name,
            avatar: selectedAvatar,
            learningGoal: parseInt(learningGoal, 10),
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const SelectedAvatarIcon = avatars.find(a => a.id === selectedAvatar)?.icon || UserCircleIcon;

    return (
        <main className="p-4 lg:p-6 max-w-screen-xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Your Profile & Settings</h1>
                <p className="text-muted-foreground mt-1">Personalize your avatar, goals, and account information.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Avatar and Stats */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-card rounded-xl border border-border p-6 text-center shadow-sm">
                            <SelectedAvatarIcon className="w-24 h-24 text-blue-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-foreground">{name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            
                            <div className="mt-6 border-t border-border pt-6 flex justify-around">
                                <div className="text-center">
                                    <FlameIcon className="w-8 h-8 text-orange-500 mx-auto"/>
                                    <p className="text-xl font-bold text-foreground mt-1">{user.streak || 0}</p>
                                    <p className="text-xs text-muted-foreground">Day Streak</p>
                                </div>
                                <div className="text-center">
                                    <TargetIcon className="w-8 h-8 text-green-500 mx-auto"/>
                                    <p className="text-xl font-bold text-foreground mt-1">{learningGoal}</p>
                                    <p className="text-xs text-muted-foreground">Weekly Goal</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Choose Your Avatar</h3>
                             <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                                {avatars.map(avatar => (
                                    <Avatar
                                        key={avatar.id}
                                        icon={avatar.icon}
                                        isSelected={selectedAvatar === avatar.id}
                                        onClick={() => setSelectedAvatar(avatar.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column: Settings */}
                    <div className="lg:col-span-2 bg-card rounded-xl border border-border p-8 shadow-sm space-y-6">
                         <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-muted-foreground">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-secondary border border-border text-foreground text-sm rounded-lg focus:ring-ring focus:border-ring block w-full p-2.5"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-muted-foreground">Email (cannot be changed)</label>
                            <input
                                type="email"
                                id="email"
                                value={user.email}
                                className="bg-muted/50 border-border text-muted-foreground text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
                                disabled
                            />
                        </div>

                        <div>
                             <label htmlFor="learning-goal" className="block mb-2 text-sm font-medium text-muted-foreground">Weekly Learning Goal</label>
                             <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    id="learning-goal"
                                    min="1"
                                    max="10"
                                    value={learningGoal}
                                    onChange={(e) => setLearningGoal(e.target.value)}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <span className="font-bold text-foreground text-lg w-12 text-center">{learningGoal}</span>
                             </div>
                             <p className="text-xs text-muted-foreground mt-1">Set how many lessons you aim to complete each week.</p>
                        </div>

                        <div className="border-t border-border pt-6 flex items-center justify-end gap-4">
                            {isSaved && (
                                <div className="flex items-center text-green-600 animate-fade-in" role="status">
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Profile saved!</span>
                                </div>
                            )}
                            <button type="submit" className="w-full sm:w-auto text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-8 py-2.5 text-center transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </main>
    );
};

export default ProfilePage;