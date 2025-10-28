import React, { useState, useEffect } from "react";
import { useGetProfileQuery, useUpdateProfileMutation } from "../../services/authApi";
import styles from "./Profile.module.css";

const ProfilePage = () => {
  const { data, isLoading, error, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating, isSuccess, isError, error: updateError }] = useUpdateProfileMutation();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    image: null,
  });
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (data) {
      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        image: null,
      });
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      setSuccessMsg("Профіль успішно оновлено!");
      refetch(); // Оновити дані профілю після збереження
      setTimeout(() => setSuccessMsg(""), 2500);
    }
  }, [isSuccess, refetch]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("phone", form.phone);
    if (form.image) formData.append("image", form.image);
    await updateProfile(formData);
  };

  return (
    <div className={styles.profileCard}>
      <h2 style={{ marginBottom: 18 }}>Профіль користувача</h2>
      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {error && <div className={styles.errorMsg}>Помилка завантаження профілю</div>}
      {isError && <div className={styles.errorMsg}>Помилка збереження профілю</div>}
      {isLoading ? (
        <div>Завантаження...</div>
      ) : (
        <form className={styles.profileForm} onSubmit={handleSubmit}>
          <div style={{ alignSelf: "center" }}>
            <img
              src={data?.image || "/public/images/user/owner.jpg"}
              alt="avatar"
              className={styles.avatar}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Ім'я</label>
            <input
              className={styles.inputField}
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              autoComplete="given-name"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Прізвище</label>
            <input
              className={styles.inputField}
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              autoComplete="family-name"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Телефон</label>
            <input
              className={styles.inputField}
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email</label>
            <input
              className={styles.inputField}
              type="email"
              value={data?.email || ""}
              disabled
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Аватар</label>
            <input
              className={styles.inputField}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          <button className={styles.saveBtn} type="submit" disabled={isUpdating}>
            {isUpdating ? "Збереження..." : "Зберегти"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage; 