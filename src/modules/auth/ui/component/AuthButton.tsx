'use client'
import { Button } from '@/components/ui/button'
import { ClapperboardIcon, UserCircleIcon, UserIcon } from 'lucide-react'
import React from 'react'
import { SignInButton, SignedIn, UserButton, SignedOut } from '@clerk/nextjs'

const AuthButton = () => {
  return (
  <>
  <SignedIn>
    <UserButton >
      <UserButton.MenuItems>
        <UserButton.Link label='My Profile' labelIcon={<UserIcon size={14} />} href='/users/current'>
          My profile
        </UserButton.Link>
        <UserButton.Link label='Studio' labelIcon={<ClapperboardIcon size={14} />} href='/studio'>
          Studio
        </UserButton.Link>
      </UserButton.MenuItems>
    </UserButton>
  </SignedIn>
  <SignedOut>
    <SignInButton mode='modal'>
    <Button variant='outline' 
    className='px-4 py-2 font-medium text-sm text-blue-600 hover:text-blue-500 border-blue-500 rounded-full shadow-none'>
        <UserCircleIcon /> Sign in
    </Button>
    </SignInButton>
    </SignedOut> 
  </>
  )
}

export default AuthButton