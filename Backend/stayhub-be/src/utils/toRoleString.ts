export default function toRoleString(roles: string[]) {
    return "{" + roles.join(",") + "}";
}