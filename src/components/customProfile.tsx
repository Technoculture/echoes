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
  DropdownMenuShortcut,
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
type Props = {};

const CustomProfile = (props: Props) => {
  const { signOut, isSignedIn, orgId, orgSlug, userId } = useAuth();

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
  console.log("user", user);
  console.log(
    "organizationList",
    organizationList?.map((o) => ({
      img: o.organization.imageUrl,
      name: o.organization.name,
    })),
    userMemberships,
  );
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.firstName}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>

          <DropdownMenuSeparator />
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
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CustomProfile;
