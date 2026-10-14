import ProfileScreen from "./(tabs)/profile";

// Council members use the same authenticated profile editor as residents so
// all displayed contact and address details come from their own account.
export default function CouncilProfileScreen() {
  return <ProfileScreen />;
}
