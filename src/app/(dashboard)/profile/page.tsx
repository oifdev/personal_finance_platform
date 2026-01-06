import { getProfile } from './actions'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
    const { data: profile } = await getProfile()

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tu Perfil</h2>
                <p className="text-muted-foreground mt-1">Gestiona tu información personal y apariencia pública.</p>
            </div>

            <ProfileForm initialData={profile} />
        </div>
    )
}
