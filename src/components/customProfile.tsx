"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownmeu";
import { LogOut, Settings, User } from "lucide-react";
import {
  useUser,
  useAuth,
  useOrganization,
  useOrganizationList,
} from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import Link from "next/link";

type Props = {};

const CustomProfile = (props: Props) => {
  const { signOut, isSignedIn, orgId, orgSlug, userId, orgRole } = useAuth();
  const [isPersonalProfile, setIsPersonalProfile] = React.useState(true);

  const { user } = useUser();

  const {
    isLoaded,
    setActive,
    createOrganization,
    userMemberships,
    userInvitations,
    userSuggestions,
    organizationList,
  } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const organization = useOrganization();
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.firstName}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 mr-4 mt-2">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link className="w-full flex" href="/user-profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuGroup>
            {organizationList?.map((o) => (
              <DropdownMenuCheckboxItem
                checked={o.membership.organization.id === orgId}
                onCheckedChange={() => {
                  setActive({ organization: o.membership.organization.id });
                }}
                key={o.membership.organization.id}
              >
                <Avatar className="mr-2 h-4 w-4">
                  <AvatarImage src={o.organization.imageUrl} />
                  <AvatarFallback>{o.organization.name[0]}</AvatarFallback>
                </Avatar>
                <span>{o.membership.organization.name}</span>
              </DropdownMenuCheckboxItem>
            ))}
            {orgRole === "admin" && (
              <DropdownMenuItem>
                <Link className="w-full flex" href={`/organization-profile`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Organization
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CustomProfile;
