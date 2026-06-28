import open3d as o3d

mesh = o3d.io.read_triangle_mesh("16834_hand_v1_NEW.obj")

mesh.compute_vertex_normals()

o3d.visualization.draw_geometries([mesh])