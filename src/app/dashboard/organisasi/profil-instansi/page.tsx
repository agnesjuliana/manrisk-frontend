"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ProfileForm } from "@/components/profile-form"

export default function ProfilInstansiPage() {
  // sample profile data; in a real app this would come from an API
  const [profile, setProfile] = React.useState({
    name: "ManRisk Org.",
    address: "Jl. Contoh No. 123",
    email: "m@example.com",
    phone: "+62 888-8888-8888",
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h2 className="text-lg font-semibold">Profil Instansi</h2>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{profile.name}</CardTitle>
            <CardDescription>Informasi dasar instansi yang terdaftar</CardDescription>
          </div>
          <CardAction>
            <Dialog>
              {/** Control dialog open from parent by using state in the dialog root */}
              <DialogTrigger asChild>
                <Button variant="outline">Edit Profil</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Perbarui Profil Instansi</DialogTitle>
                  <DialogDescription>Ubah informasi instansi Anda di sini.</DialogDescription>
                </DialogHeader>
                <ProfileForm
                  initialValues={profile}
                  onSubmitProfile={(values) => {
                    setProfile(values)
                    // dialog close will be handled by the Dialog component's close button
                  }}
                  submitLabel="Simpan Perubahan"
                />
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div>
              <div className="text-sm text-muted-foreground">Alamat</div>
              <div className="font-medium">{profile.address}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{profile.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Telepon</div>
              <div className="font-medium">{profile.phone}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 min-h-[40vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  )
}
