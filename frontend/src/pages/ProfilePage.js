import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import StudentLayout from "../components/layout/StudentLayout";

function formatRole(role) {
  return role === "admin" ? "Admin" : "Student";
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
}

function getNameFromEmail(email) {
  if (!email) {
    return "User";
  }

  return email
    .split("@")[0]
    .split(".")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function getProfileKey(role, authEmail) {
  return `smartCampusProfile:${role}:${authEmail || "current"}`;
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function getDefaultProfile(role) {
  const authEmail = localStorage.getItem("authEmail") || localStorage.getItem("userEmail") || "";
  const profileKey = getProfileKey(role, authEmail);
  const savedProfile = readJson(profileKey);
  const displayEmail = savedProfile.email || localStorage.getItem("userEmail") || authEmail;
  const displayName = savedProfile.fullName || localStorage.getItem("userName") || getNameFromEmail(displayEmail);
  const nameParts = splitName(displayName);

  if (authEmail && !localStorage.getItem("authEmail")) {
    localStorage.setItem("authEmail", authEmail);
  }

  return {
    firstName: savedProfile.firstName || localStorage.getItem("userFirstName") || nameParts.firstName,
    lastName: savedProfile.lastName || localStorage.getItem("userLastName") || nameParts.lastName,
    email: displayEmail,
    role,
    phoneNumber: savedProfile.phoneNumber || localStorage.getItem("userPhoneNumber") || "",
    departmentFaculty:
      savedProfile.departmentFaculty ||
      localStorage.getItem("userDepartmentFaculty") ||
      "",
  };
}

function validateProfile(profile) {
  const errors = {};

  if (!profile.firstName.trim()) {
    errors.firstName = "First Name is required.";
  }

  if (!profile.lastName.trim()) {
    errors.lastName = "Last Name is required.";
  }

  if (!profile.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

function ProfilePage({ role = "student" }) {
  const normalizedRole = role === "admin" ? "admin" : "student";
  const Layout = normalizedRole === "admin" ? AdminLayout : StudentLayout;
  const [profile, setProfile] = useState(() => getDefaultProfile(normalizedRole));
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadedProfile = getDefaultProfile(normalizedRole);
    setProfile(loadedProfile);
    setDraft(loadedProfile);
    setEditing(false);
    setErrors({});
    setSuccess("");
  }, [normalizedRole]);

  const fullName = useMemo(() => {
    return `${draft.firstName} ${draft.lastName}`.trim();
  }, [draft.firstName, draft.lastName]);

  const avatarInitials = getInitials(fullName || draft.email);

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSuccess("");
  };

  const handleEdit = () => {
    setDraft(profile);
    setEditing(true);
    setErrors({});
    setSuccess("");
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
    setErrors({});
    setSuccess("");
  };

  const handleSave = () => {
    const nextErrors = validateProfile(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const authEmail = localStorage.getItem("authEmail") || localStorage.getItem("userEmail") || draft.email.trim();
    const savedProfile = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      fullName: `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim(),
      email: draft.email.trim(),
      role: normalizedRole,
      phoneNumber: draft.phoneNumber.trim(),
      departmentFaculty: draft.departmentFaculty.trim(),
    };

    // TODO: Connect profile update to backend/database
    localStorage.setItem("authEmail", authEmail);
    localStorage.setItem("userName", savedProfile.fullName);
    localStorage.setItem("userEmail", savedProfile.email);
    localStorage.setItem("role", normalizedRole);
    localStorage.setItem("userFirstName", savedProfile.firstName);
    localStorage.setItem("userLastName", savedProfile.lastName);
    localStorage.setItem("userPhoneNumber", savedProfile.phoneNumber);
    localStorage.setItem("userDepartmentFaculty", savedProfile.departmentFaculty);
    localStorage.setItem(
      getProfileKey(normalizedRole, authEmail),
      JSON.stringify(savedProfile)
    );

    setProfile(savedProfile);
    setDraft(savedProfile);
    setEditing(false);
    setSuccess("Profile updated successfully.");
    window.dispatchEvent(new Event("profile-updated"));
  };

  const inputClass = `h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none ${
    editing ? "bg-white" : "bg-gray-50"
  }`;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500">View and manage your account details</p>
        </div>

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        <section className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-xl font-bold text-white">
                {avatarInitials}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {fullName || "User"}
                </h2>
                <p className="text-sm text-gray-500">{draft.email}</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    normalizedRole === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {formatRole(normalizedRole)}
                </span>
              </div>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                value={draft.firstName}
                onChange={(event) => updateDraft("firstName", event.target.value)}
                disabled={!editing}
                className={inputClass}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                value={draft.lastName}
                onChange={(event) => updateDraft("lastName", event.target.value)}
                disabled={!editing}
                className={inputClass}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                value={fullName}
                disabled
                className="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={draft.email}
                onChange={(event) => updateDraft("email", event.target.value)}
                disabled={!editing}
                className={inputClass}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                value={formatRole(normalizedRole)}
                disabled
                className="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                value={draft.phoneNumber}
                onChange={(event) => updateDraft("phoneNumber", event.target.value)}
                disabled={!editing}
                className={inputClass}
                placeholder={editing ? "+94 77 123 4567" : ""}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Department / Faculty
              </label>
              <input
                value={draft.departmentFaculty}
                onChange={(event) => updateDraft("departmentFaculty", event.target.value)}
                disabled={!editing}
                className={inputClass}
                placeholder={editing ? "Faculty of Computing" : ""}
              />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default ProfilePage;
