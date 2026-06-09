class Camera
{
    constructor(fov_lr_deg, fov_td_deg, near, far,
                pos, dir, up)
    {
        this._proj = new Matrix4x4();
        this._proj.set_perspective(fov_lr_deg, fov_td_deg, near, far)

        this.set_pos(pos);
        this.set_dir(dir);
        this.set_up(up);

        // Private variables for 'lookat' operation
        this._trans_mat = new Matrix4x4();
        this._rot_mat   = new Matrix4x4();
        this._view      = new Matrix4x4();
    }

    set_pos(pos)
    {
        this._pos = structuredClone(pos);
    }

    set_dir(dir)
    {
        this._dir = structuredClone(dir);
    }

    set_up(up)
    {
        this._up = structuredClone(up);
    }

    view_mat()
    {
        this._trans_mat.set_translate(-this._pos[0], -this._pos[1], -this._pos[2]);

        var Z = _normalize_r3(this._dir);
        var X = _normalize_r3( _cross_r3(this._up, Z) );
        var Y = _cross_r3(Z, X);

        this._rot_mat.set_identity();
        this._rot_mat.set(0, 0, X[0]);
        this._rot_mat.set(0, 1, X[1]);
        this._rot_mat.set(0, 2, X[2]);
        this._rot_mat.set(1, 0, Y[0]);
        this._rot_mat.set(1, 1, Y[1]);
        this._rot_mat.set(1, 2, Y[2]);
        this._rot_mat.set(2, 0, Z[0]);
        this._rot_mat.set(2, 1, Z[1]);
        this._rot_mat.set(2, 2, Z[2]);

        this._view = this._rot_mat.mult( this._trans_mat );
        return this._view;        
    }

    proj_mat()
    {
        return this._proj;
    }

    pos()
    {
        return this._pos;
    }

    dir()
    {
        return this._dir;
    }

    up()
    {
        return this._up;
    }
}